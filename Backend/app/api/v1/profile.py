import random
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, DataError
from sqlalchemy import text
from pydantic import EmailStr

from app.db import get_db
from app.utility import limiter
from app.utility.time import utc_now
from app.core.config import settings
from app.utility.auth import validate_user_access, hash_password
from app.schema.v1.profile import UpdateProfile, ChangeUsername, ChangeEmail
from app.utility.brevo import send_email


router = APIRouter(prefix="/profile", tags=["profile"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


@router.get("/me")
async def get_me(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    access = validate_user_access(token)
    if not access["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token"),
        )
    uuid = access["data"]["uuid"]
    try:
        result = await db.execute(
            text("""
				SELECT 
					u.uuid, 
					u.email, 
					u.hashed_password, 
					u.status, 
					u.role as user_role,
					u.updated_at as user_updated_at,
					s.student_batch,
					s.updated_at as student_updated_at,
					u.image_url  -- Updated to pull directly from the users table
				FROM users u
				LEFT JOIN students s ON u.id = s.id
				-- Removed the LEFT JOIN to assets table
				WHERE u.uuid = :uuid 
			"""),
            {"uuid": uuid},
        )
        user = result.mappings().first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
            )
        profile_type = "USER" if user["student_batch"] is not None else "ADMIN"
        profile_image = user["image_url"] or settings.default_profile_image_url
        user_profile = {
            "uuid": str(user["uuid"]),
            "email": user["email"],
            "status": user["status"],
            "user_role": user["user_role"],
            "profile_type": profile_type,
            "profile_image": profile_image,
            "user_updated_at": user["user_updated_at"].isoformat()
            if user["user_updated_at"]
            else None,
        }
        if profile_type == "USER":
            user_profile["student_batch"] = user["student_batch"]
            user_profile["student_updated_at"] = (
                user["student_updated_at"].isoformat()
                if user["student_updated_at"]
                else None
            )
        return {"data": user_profile}

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request",
        )


@router.patch("/me")
async def update_me(
    payload: UpdateProfile,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    # 1. Validate Token
    auth = validate_user_access(token)
    if not auth["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=auth.get("message", "Invalid or expired token"),
        )

    user_uuid = auth["data"]["uuid"]

    # 2. Extract only provided fields
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update.",
        )

    # 3. Handle Special Fields (Password & Type Casting)
    if "password" in update_data:
        raw_password = update_data.pop("password")
        # Apply your actual hashing function here
        update_data["hashed_password"] = hash_password(raw_password)

    if "student_batch" in update_data and update_data["student_batch"] is not None:
        try:
            # Cast the string to int for the DB
            update_data["student_batch"] = int(update_data["student_batch"])
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="student_batch must be a valid number.",
            )

    try:
        # 4. Get the internal user ID and Role
        check_query = text(
            "SELECT id, role FROM users WHERE uuid = CAST(:uuid AS UUID)"
        )
        result = await db.execute(check_query, {"uuid": user_uuid})
        user_row = result.mappings().first()

        if not user_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
            )

        user_id = user_row["id"]
        user_role = user_row["role"]

        # 5. Filter allowed fields mapping to respective tables
        valid_user_fields = {
            "name",
            "bio",
            "mobile_number",
            "image_url",
            "hashed_password",
        }
        valid_student_fields = {"student_batch"}

        user_updates = {k: v for k, v in update_data.items() if k in valid_user_fields}
        student_updates = {
            k: v for k, v in update_data.items() if k in valid_student_fields
        }

        # Prevent non-students from updating student_batch
        if student_updates and user_role != "STUDENT" and user_role != "MODERATOR":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can update student-specific fields like batch.",
            )

        current_time = utc_now()

        # 6. Execute Dynamic Updates
        if user_updates:
            set_clauses = [f"{k} = :{k}" for k in user_updates.keys()]
            set_clauses.append("updated_at = :current_time")

            update_user_query = text(
                f"UPDATE users SET {', '.join(set_clauses)} WHERE id = :id"
            )
            await db.execute(
                update_user_query,
                {"id": user_id, "current_time": current_time, **user_updates},
            )

        if student_updates:
            set_clauses = [f"{k} = :{k}" for k in student_updates.keys()]
            set_clauses.append("updated_at = :current_time")

            update_student_query = text(
                f"UPDATE students SET {', '.join(set_clauses)} WHERE id = :id"
            )
            await db.execute(
                update_student_query,
                {"id": user_id, "current_time": current_time, **student_updates},
            )

        await db.commit()
        return {"message": "Profile updated successfully."}

    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database conflict. The email or other unique value might already exist.",
        )
    except DataError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid data format provided.",
        )
    except HTTPException:
        await db.rollback()
        raise
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while updating your profile.",
        )
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.post("/change-username")
async def change_username(
    payload: ChangeUsername,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    response = validate_user_access(token)
    if not response["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=response.get("message", "Invalid or expired token"),
        )

    user_role = response["data"]["user_role"]
    if user_role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin is not allowed to change their username",
        )

    try:
        # 1. Check if the username already exists
        check_query = await db.execute(
            text("""
				SELECT username
				FROM users
				WHERE username = :username
				LIMIT 1
			"""),
            {"username": payload.username},
        )

        # 2. Extract the first row or None
        existing_username = check_query.scalar_one_or_none()

        # 3. FIX: Actually raise an error if the username is found
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken",
            )

    except HTTPException:
        # Re-raise the HTTP 400 exception so it doesn't get caught by the generic Exception block
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process username validation request",
        )

    try:
        # 4. Perform the update if the username is available
        update_query = await db.execute(
            text("""
				UPDATE users
				SET username = :username
				WHERE uuid = :uuid
				RETURNING uuid, username
			"""),
            {"username": payload.username, "uuid": response["data"]["uuid"]},
        )
        await db.commit()
        updated_user = update_query.mappings().first()

        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return {"data": updated_user}

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request",
        )


@router.post("/change-email-otp")
async def change_email_otp(
    email: EmailStr,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    response = validate_user_access(token)
    if not response["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=response.get("message", "Invalid or expired token"),
        )
    user_role = response["data"]["user_role"]
    if user_role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin is not allowed to change their email",
        )

    # Check if the user actually exists first
    existing_user = await db.execute(
        text("SELECT id FROM users WHERE email = :email"), {"email": email}
    )
    if existing_user.first():
        raise HTTPException(
            status_code=400, detail="Email already is used by another account."
        )

    user_uuid = response["data"]["uuid"]
    current_time = utc_now()

    otp = str(random.randint(100000, 999999))
    expires_at = utc_now() + timedelta(minutes=2)
    try:
        await db.execute(
            text("""
				UPDATE email_otps
				SET is_valid = FALSE
				WHERE email = :email
				AND purpose = 'CHANGE_EMAIL'
			"""),
            {"email": email},
        )
        await db.execute(
            text("""
				INSERT INTO email_otps
				(email, otp, purpose, expires_at, is_used)
				VALUES (:email, :otp, 'CHANGE_EMAIL', :expires_at, FALSE)
			"""),
            {"email": email, "otp": otp, "expires_at": expires_at},
        )
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process reset request")
    try:
        await send_email(email, "Email Change", f"Your OTP is {otp}")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to send OTP email")
    return {"is_successful": True, "message": "If email exists, OTP sent"}


@router.post("/change-email")
async def change_email(
    payload: ChangeEmail,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    response = validate_user_access(token)
    if not response["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=response.get("message", "Invalid or expired token"),
        )

    user_role = response["data"]["user_role"]
    if user_role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin is not allowed to change their email",
        )

    user_uuid = response["data"]["uuid"]
    current_time = utc_now()

    try:
        # 1. Verify the OTP
        otp_query = text("""
			SELECT id 
			FROM email_otps
			WHERE email = :email
				AND otp = :otp
				AND purpose = 'CHANGE_EMAIL'
				AND is_used = FALSE
				AND is_valid = TRUE
				AND expires_at > :current_time
			ORDER BY created_at DESC
			LIMIT 1
		""")

        otp_result = await db.execute(
            otp_query,
            {
                "email": payload.new_email,
                "otp": payload.otp,
                "current_time": current_time,
            },
        )

        otp_record = otp_result.mappings().first()
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP.",
            )

        otp_id = otp_record["id"]

        # 2. Mark the OTP as used and invalid
        await db.execute(
            text("""
				UPDATE email_otps
				SET is_used = TRUE, is_valid = FALSE
				WHERE id = :otp_id
			"""),
            {"otp_id": otp_id},
        )

        # 3. Update User Email
        user_update_query = text("""
			UPDATE users 
			SET email = :new_email, 
				updated_at = :current_time
			WHERE uuid = CAST(:uuid AS UUID)
			RETURNING id
		""")

        result = await db.execute(
            user_update_query,
            {
                "new_email": payload.new_email,
                "current_time": current_time,
                "uuid": user_uuid,
            },
        )

        updated_user = result.scalar_one_or_none()

        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
            )

        await db.commit()
        return {"message": "Email updated successfully."}

    except HTTPException:
        await db.rollback()
        raise
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email address is already in use by another account.",
        )
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while updating your email.",
        )


@router.get("/me/last-update")
async def get_me_last_update(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    response = validate_user_access(token)
    if not response["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=response.get("message", "Invalid or expired token"),
        )

    try:
        result = await db.execute(
            text("""
				SELECT 
					GREATEST(u.updated_at, COALESCE(s.updated_at, u.updated_at)) AS last_updated_at
				FROM users u
				LEFT JOIN students s ON u.id = s.id
				WHERE u.uuid = :uuid
			"""),
            {"uuid": response["data"]["uuid"]},
        )

        # Fetch just the specific value using scalar()
        last_updated = result.scalar()
        if not last_updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return {"last_updated_at": last_updated.isoformat()}
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request",
        )
