from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.utility import limiter
from app.utility.auth import validate_user_access, validate_admin_access
from app.utility.time import bd_now


router = APIRouter(prefix="/moderators", tags=["moderators"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


@router.get("")
async def list_moderators(
	db: AsyncSession = Depends(get_db)
):
	try:
		# Query only safe, public columns for users with the ADMIN role
		response = await db.execute(
			text("""
				SELECT 
					uuid,
					name,
					email,
					mobile_number,
					status
				FROM users
				WHERE role = 'MODERATOR'
				ORDER BY created_at DESC
			""")
		)
		
		# Retrieve all rows as mappings (dictionaries)
		moderators = response.mappings().all()
		return {"data": moderators}
		
	except Exception as e:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Error retrieving moderators: {str(e)}"
		)
	

@router.get("/interested-to-be-moderator")
async def list_interested_moderators(
	db: AsyncSession = Depends(get_db),
	token: str = Depends(oauth2_scheme)
):
	auth = validate_admin_access(token)
	if not auth["is_valid"]:
		raise HTTPException(status_code=401, detail="Invalid token")
	try:
		# Query users who have requested to be moderators
		response = await db.execute(
			text("""
				SELECT 
					u.uuid,
					u.name,
					u.email,
					u.mobile_number,
					r.created_at AS request_created_at
				FROM tobe_moderator_requests r
				JOIN users u ON r.user_id = u.id
				ORDER BY r.created_at DESC
			""")
		)
		# 1. Fetch all rows
		rows = response.mappings().all()
		
		# 2. Convert to standard dictionaries and apply your bd_now() function
		interested_users = []
		for row in rows:
			user_dict = dict(row)
			# Apply your custom function to the datetime object
			user_dict["request_created_at"] = bd_now(user_dict["request_created_at"])
			interested_users.append(user_dict)

		return {"data": interested_users}
		
	except Exception as e:
		print(str(e))
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Error retrieving interested moderators",
		)
	

@router.get("/if-interested-to-be-moderator")
async def check_if_interested_to_be_moderator(
	db: AsyncSession = Depends(get_db)
):
	return {"message": "Not implemented yet"}


@router.post("/request-to-be-moderator", status_code=status.HTTP_201_CREATED)
async def request_to_be_moderator(
	db: AsyncSession = Depends(get_db)
):
	return {"message": "Not implemented yet"}

	
@router.delete("/request-to-be-moderator", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request_to_be_moderator(
	db: AsyncSession = Depends(get_db)
):
	return {"message": "Not implemented yet"}


# ==========================================
# DYNAMIC ROUTES (Protected by :uuid converter)
# ==========================================

@router.get("/{uuid:uuid}")
async def get_moderator(
	uuid: UUID,
	db: AsyncSession = Depends(get_db)
):
	try:
		# Query public metadata for an MODERATOR user matching the UUID
		response = await db.execute(
			text("""
				SELECT 
					uuid,
					name,
					username,
					bio,
					email,
					mobile_number,
					status,
					address,
					created_at
				FROM users
				WHERE uuid = :uuid AND role = 'MODERATOR'
			"""),
			{"uuid": str(uuid)}  # Cast to string for raw SQL compatibility
		)
		moderator = response.mappings().first()
		if not moderator:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail="Moderator not found"
			)
			
		return {"data": moderator}
		
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Error retrieving moderator: {str(e)}"
		)


@router.post("/{uuid:uuid}")
async def create_moderator(
	uuid: UUID,
	db: AsyncSession = Depends(get_db)
):
	"""
	Promotes an existing user (e.g., a STUDENT) to moderator status (MODERATOR).
	"""
	try:
		# Update the user's role to 'MODERATOR' and set status to 'ACTIVE'
		response = await db.execute(
			text("""
				UPDATE users
				SET 
					role = CAST('MODERATOR' AS account_role),
					status = CAST('ACTIVE' AS account_status),
					updated_at = NOW()
				WHERE uuid = :uuid
				RETURNING uuid, name, username, email, role, status
			"""),
			{"uuid": str(uuid)}
		)
		updated_user = response.mappings().first()
		
		if not updated_user:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail="User not found"
			)
			
		await db.commit()
		return {
			"message": "User successfully promoted to moderator",
			"data": updated_user
		}
		
	except HTTPException:
		raise
	except Exception as e:
		await db.rollback()
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Error promoting user to moderator: {str(e)}"
		)


@router.delete("/{uuid:uuid}")
async def delete_moderator(
	uuid: UUID,
	db: AsyncSession = Depends(get_db)
):
	"""
	Demotes a moderator back to a STUDENT role or updates their status.
	Depending on your business logic, you can choose to either:
	1) Hard DELETE the user from the database, or
	2) Demote their role back to 'STUDENT' (Safe & Recommended to avoid data orphans).
	
	The implementation below performs a Demotion (Role reset).
	"""
	try:
		# Reset role back to 'STUDENT'
		response = await db.execute(
			text("""
				UPDATE users
				SET 
					role = CAST('STUDENT' AS account_role),
					updated_at = NOW()
				WHERE uuid = :uuid AND role = 'MODERATOR'
				RETURNING uuid, name, username, role
			"""),
			{"uuid": str(uuid)}
		)
		demoted_user = response.mappings().first()
		
		if not demoted_user:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail="Moderator not found"
			)
			
		await db.commit()
		return {
			"message": "Moderator successfully demoted back to student",
			"data": demoted_user
		}
		
	except HTTPException:
		raise
	except Exception as e:
		await db.rollback()
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Error removing moderator status: {str(e)}"
		)