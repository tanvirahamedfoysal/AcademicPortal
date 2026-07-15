from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.utility import limiter


router = APIRouter(prefix="/moderators", tags=["moderators"])


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
	

@router.get("/{uuid}")
async def get_moderator(
	uuid: str,
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
			{"uuid": uuid}
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


@router.post("/{uuid}")
async def create_moderator(
	uuid: str,
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
			{"uuid": uuid}
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


@router.delete("/{uuid}")
async def delete_moderator(
	uuid: str,
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
			{"uuid": uuid}
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