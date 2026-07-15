import random
from datetime import timedelta
from typing_extensions import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.utility import limiter
from app.utility.auth import create_access_token, hash_password, verify_password, verify_token
from app.schema.v1.auth import UserRegister, ValidateUsername, RequestOTP, ResetOTP, EmailVerification
from app.utility.brevo import send_email
from app.utility.time import bd_now, utc_now
from app.core.config import settings


router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


@router.get("/validate-token")
async def validate_token(
	token: str = Depends(oauth2_scheme)
):
	response = verify_token(token)
	if not response["is_valid"]:
		raise HTTPException(status_code=401, detail="Invalid or expired token")
	return {"message": "Token is valid", "user": response["data"]}


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Fetch user info with student batch and profile image link via LEFT JOINs
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
                    a.url as image_url
                FROM users u
                LEFT JOIN students s ON u.id = s.id
                LEFT JOIN assets a ON u.image_id = a.id
                WHERE u.username = :credential OR u.email = :credential
            """),
            {"credential": form_data.username}
        )
        user = result.mappings().first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid credentials"
            )
            
        if not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid credentials"
            )

        profile_type = "USER" if user["student_batch"] is not None else "ADMIN"
        
        profile_image = user["image_url"] or settings.default_profile_image_url
        
        # Base user response profile
        user_profile = {
            "uuid": str(user["uuid"]),
            "email": user["email"],
            "status": user["status"],
            "user_role": user["user_role"],
            "profile_type": profile_type,
            "profile_image": profile_image,
            "user_updated_at": user["user_updated_at"].isoformat() if user["user_updated_at"] else None
        }

        if profile_type == "USER":
            user_profile["student_batch"] = user["student_batch"]
            user_profile["student_updated_at"] = (
                user["student_updated_at"].isoformat() if user["student_updated_at"] else None
            )

        return {
            "message": "Login successful",
            "access_token": create_access_token({
                "uuid": str(user["uuid"]),
                "email": user["email"],
                "status": user["status"],
                "user_role": user["user_role"]
            }), 
            "token_type": "bearer",
            "user": user_profile
        }
        
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="An error occurred while processing your request"
        )
	

@router.post("/validate-username")
async def validate_username(
	payload: ValidateUsername,
	db: AsyncSession = Depends(get_db)
):
	try:
		# 1. Store the execution result
		query_result = await db.execute(
			text("""
				SELECT username
				FROM users
				WHERE username = :username
				LIMIT 1
			"""),
			{"username": payload.username}
		)
		
		# 2. Extract the first row or None using scalar_one_or_none()
		result = query_result.scalar_one_or_none()

	except Exception as e:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
			detail="Failed to process username validation request"
		)
	
	if not result:
		return {"is_available": True, "message": "Username is available"}
	
	return {"is_available": False, "message": "Username is already taken"}


@router.post("/register/request-otp")
async def request_registration_otp(
	payload: RequestOTP,
	db: AsyncSession = Depends(get_db)
):
	# Check if the user actually exists first
	existing_user = await db.execute(
		text("SELECT id FROM users WHERE email = :email"),
		{"email": payload.email}
	)
	if existing_user.first():
		raise HTTPException(status_code=400, detail="Email already exists")
	
	# If not, generate OTP, store it in the database and send it via email
	otp = str(random.randint(100000, 999999))
	expires_at = utc_now() + timedelta(minutes=2)
	try:
		await db.execute(
			text("""
				UPDATE email_otps
				SET is_valid = FALSE
				WHERE email = :email
				AND purpose = 'REGISTER'
			"""),
			{"email": payload.email}
		)
		await db.execute(
			text("""
				INSERT INTO email_otps
				(email, otp, purpose, expires_at, is_used)
				VALUES (:email, :otp, 'REGISTER', :expires_at, FALSE)
			"""),
			{"email": payload.email, "otp": otp, "expires_at": expires_at}
		)
		await db.commit()
	except Exception:
		await db.rollback()
		raise HTTPException(status_code=500, detail="Failed to process reset request")

	if existing_user:
		try:
			await send_email(
				payload.email,
				"Password Reset",
				f"Your OTP is {otp}"
			)
		except Exception:
			raise HTTPException(status_code=500, detail="Failed to send OTP email")
	return {"is_successful": True, "message": "If email exists, OTP sent"}



@router.post("/register")
async def register_student(
    payload: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    try:
        check_existing = await db.execute(
            text("""
                SELECT username, email FROM users 
                WHERE username = :username OR email = :email
            """),
            {"username": payload.username, "email": payload.email}
        )
        existing_record = check_existing.mappings().first()
        if existing_record:
            if existing_record["email"] == payload.email:
                raise HTTPException(status_code=400, detail="Email is already registered")
            if existing_record["username"] == payload.username:
                raise HTTPException(status_code=400, detail="Username is already taken")

        otp_query = await db.execute(
            text("""
                SELECT otp FROM email_otps
                WHERE email = :email
                AND purpose = 'REGISTER'
                AND is_valid = TRUE
                AND is_used = FALSE
                AND expires_at > NOW()
            """),
            {"email": payload.email}
        )
        db_record = otp_query.mappings().first()
        if not db_record:
            raise HTTPException(status_code=400, detail="Expired or non-existent OTP. Please request a new one.")
        
        if db_record["otp"] != payload.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")

        user_result = await db.execute(
            text("""
                INSERT INTO users (name, username, email, hashed_password, role, status)
                VALUES (:name, :username, :email, :hashed_password, 'STUDENT', 'ACTIVE')
                RETURNING id, uuid, role, status, updated_at
            """),
            {
                "name": payload.name,
                "username": payload.username,
                "email": payload.email,
                "hashed_password": hash_password(payload.password)
            }
        )
        new_user = user_result.mappings().first()
        user_id = new_user["id"]

        try:
            batch_integer = int(payload.student_batch)
        except ValueError:
            raise HTTPException(status_code=400, detail="Student batch must be a valid number string (e.g., '2026')")

        student_result = await db.execute(
            text("""
                INSERT INTO students (id, student_batch)
                VALUES (:id, :student_batch)
                RETURNING student_batch, updated_at
            """),
            {
                "id": user_id,
                "student_batch": batch_integer
            }
        )
        new_student = student_result.mappings().first()

        await db.execute(
            text("""
                UPDATE email_otps
                SET is_valid = FALSE, is_used = TRUE
                WHERE email = :email
                AND purpose = 'REGISTER'
            """),
            {"email": payload.email}
        )

        await db.commit()

        profile_image_url = settings.default_profile_image_url if 'settings' in globals() else None

        return {
            "is_successful": True,
            "message": "Student registration completed successfully",
            "user": {
                "uuid": str(new_user["uuid"]),
                "name": payload.name,
                "username": payload.username,
                "email": payload.email,
                "status": new_user["status"],
                "user_role": new_user["role"],
                "profile_type": "student",
                "profile_image": profile_image_url,
                "student_batch": new_student["student_batch"],
                "user_updated_at": new_user["updated_at"].isoformat() if new_user["updated_at"] else None,
                "student_updated_at": new_student["updated_at"].isoformat() if new_student["updated_at"] else None
            }
        }

    except HTTPException as http_ex:
        await db.rollback()
        raise http_ex
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to an internal server error"
        )


@router.post("/password-reset/request-otp")
async def request_password_reset_otp(
	payload: RequestOTP,
	db: AsyncSession = Depends(get_db)
):
	# Check if the user actually exists first
	existing_user = await db.execute(
		text("SELECT id FROM users WHERE email = :email"),
		{"email": payload.email}
	)
	user = existing_user.mappings().first()
	if not user:
		raise HTTPException(status_code=404, detail="User not found")

	# If exists, generate OTP, store it in the database and send it via email
	otp = str(random.randint(100000, 999999))
	expires_at = utc_now() + timedelta(minutes=2)
	try:
		await db.execute(
			text("""
				UPDATE email_otps
				SET is_valid = FALSE
				WHERE email = :email
				AND purpose = 'PASSWORD_RESET'
			"""),
			{"email": payload.email}
		)
		await db.execute(
			text("""
				INSERT INTO email_otps
				(email, otp, purpose, expires_at, is_used)
				VALUES (:email, :otp, 'PASSWORD_RESET', :expires_at, FALSE)
			"""),
			{"email": payload.email, "otp": otp, "expires_at": expires_at}
		)
		await db.commit()
	except Exception:
		await db.rollback()
		raise HTTPException(status_code=500, detail="Failed to process reset request")

	if existing_user:
		try:
			await send_email(
				payload.email,
				"Password Reset",
				f"Your OTP is {otp}"
			)
		except Exception:
			raise HTTPException(status_code=500, detail="Failed to send OTP email")
	return {"is_successful": True, "message": "If email exists, OTP sent"}


@router.patch("/password-reset")
async def reset_password(
	payload: ResetOTP,
	db: AsyncSession = Depends(get_db)
):
	try:
		# 1. Execute the query
		result = await db.execute(
			text("""
				SELECT otp
				FROM email_otps
				WHERE email = :email
				AND purpose = 'PASSWORD_RESET'
				AND is_valid = TRUE
				AND expires_at > NOW()
			"""),
			{"email": payload.email}
		)
		db_record = result.mappings().first()
		if not db_record:
			raise HTTPException(status_code=400, detail="Expired or non-existent OTP")
			
		db_otp = db_record["otp"]

		if payload.otp == db_otp:
			await db.execute(
				text("""
					UPDATE users
					SET hashed_password = :new_password
					WHERE email = :email
				"""),
				{"new_password": hash_password(payload.new_password), "email": payload.email}
			)
			await db.execute(
				text("""
					UPDATE email_otps
					SET is_valid = FALSE, is_used = TRUE
					WHERE email = :email
					AND purpose = 'PASSWORD_RESET'
				"""),
				{"email": payload.email}
			)
			await db.commit()
			return {"is_successful": True, "message": "Password reset successful"}
		else:
			raise HTTPException(status_code=400, detail="Invalid OTP")

	except HTTPException as http_ex:
		await db.rollback()
		raise http_ex
		
	except Exception as e:
		await db.rollback()
		raise HTTPException(status_code=500, detail="Failed to process reset request")
	

@router.post("/validate-email")
async def validate_email(
	payload: EmailVerification,
	db: AsyncSession = Depends(get_db)
):
	try:
		# 1. Store the execution result
		query_result = await db.execute(
			text("""
				SELECT email
				FROM users
				WHERE email = :email
				LIMIT 1
			"""),
			{"email": payload.email}
		)
		
		# 2. Extract the first row or None using scalar()
		result = query_result.scalar_one_or_none()

	except Exception as e:
		# It's highly recommended to print/log the actual error here during development
		# print(f"Database error: {e}") 
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
			detail="Failed to process reset request"
		)
	
	if not result:
		return {"is_available": True, "message": "Email is available"}
	
	return {"is_available": False, "message": "Email is already taken"}