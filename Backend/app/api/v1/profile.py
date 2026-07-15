from typing import Any
from fastapi import APIRouter, Depends, HTTPException, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db
from app.utility import limiter
from app.core.config import settings
from app.utility.auth import validate_user_access


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
					a.url as image_url
				FROM users u
				LEFT JOIN students s ON u.id = s.id
				LEFT JOIN assets a ON u.image_id = a.id
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
	token: str = Depends(oauth2_scheme),
	db: AsyncSession = Depends(get_db),
	payload: dict[str, Any] = None
):
	return {"message": "Not implemented yet"}


@router.post("/change-email")
async def change_email(
	token: str = Depends(oauth2_scheme),
	db: AsyncSession = Depends(get_db),
	payload: dict[str, Any] = None
):
	return {"message": "Not implemented yet"}


@router.get("/me/last-update")
async def get_me_last_update(
	token: str = Depends(oauth2_scheme),
	db: AsyncSession = Depends(get_db)
):
	return {"message": "Not implemented yet"}

