from typing import Any
from fastapi import APIRouter, Depends, HTTPException, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db
from app.utility import limiter
from app.core.config import settings
from app.utility.auth import verify_token, validate_user_access
from app.schema.v1.profile import UpdateProfile, ChangeUsername


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
			detail=access.get("message", "Invalid or expired token")
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
			{"uuid": uuid}
		)
		user = result.mappings().first()
		if not user:
			raise HTTPException(
				status_code=status.HTTP_401_UNAUTHORIZED, 
				detail="Invalid credentials"
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
			"user_updated_at": user["user_updated_at"].isoformat() if user["user_updated_at"] else None
		}
		if profile_type == "USER":
			user_profile["student_batch"] = user["student_batch"]
			user_profile["student_updated_at"] = (
				user["student_updated_at"].isoformat() if user["student_updated_at"] else None
			)
		return {
			"data": user_profile
		}
		
	except HTTPException as http_ex:
		raise http_ex
	except Exception as e:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
			detail="An error occurred while processing your request"
		)


@router.patch("/me")
async def update_me(
	token: str = Depends(oauth2_scheme),
	db: AsyncSession = Depends(get_db),
	payload: dict[str, Any] = None
):
	return {"message": "Not implemented yet"}



@router.post("/change-username")
async def change_username(
	payload: ChangeUsername,
	token: str = Depends(oauth2_scheme),
	db: AsyncSession = Depends(get_db)
):
	response = validate_user_access(token)
	if not response["is_valid"]:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail=response.get("message", "Invalid or expired token")
		)
        
	user_role = response["data"]["user_role"]
	if user_role == "ADMIN":
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Admin is not allowed to change their username"
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
			{"username": payload.username}
		)
		
		# 2. Extract the first row or None
		existing_username = check_query.scalar_one_or_none()

        # 3. FIX: Actually raise an error if the username is found
		if existing_username:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail="Username is already taken"
			)

	except HTTPException:
        # Re-raise the HTTP 400 exception so it doesn't get caught by the generic Exception block
		raise
	except Exception as e:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
			detail="Failed to process username validation request"
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
			{"username": payload.username, "uuid": response["data"]["uuid"]}
		)
		await db.commit()
		updated_user = update_query.mappings().first()
        
		if not updated_user:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail="User not found"
			)
		return {"data": updated_user}
        
	except HTTPException as http_ex:
		raise http_ex
	except Exception as e:
		await db.rollback()
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="An error occurred while processing your request"
		)


##########
##########
##########
@router.post("/change-email")
async def change_email(
	token: str = Depends(oauth2_scheme),
	db: AsyncSession = Depends(get_db),
	payload: dict[str, Any] = None
):
	return {"message": "Not implemented yet"}
	response = validate_user_access(token)
	if not response["is_valid"]:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail=response.get("message", "Invalid or expired token")
		)
	user_role = response["data"]["user_role"]
	if user_role == "ADMIN":
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Admin is not allowed to change their username"
		)
	pass


@router.get("/me/last-update")
async def get_me_last_update(
	token: str = Depends(oauth2_scheme),
	db: AsyncSession = Depends(get_db)
):
	response = validate_user_access(token)
	if not response["is_valid"]:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail=response.get("message", "Invalid or expired token")
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
			{"uuid": response["data"]["uuid"]}
		)
		
		# Fetch just the specific value using scalar()
		last_updated = result.scalar()
		if not last_updated:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND, 
				detail="User not found"
			)
		return {
			"last_updated_at": last_updated.isoformat()
		}
	except HTTPException as http_ex:
		raise http_ex
	except Exception as e:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
			detail="An error occurred while processing your request"
		)