from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schema.v1.contact import CreateMessage
from app.utility import limiter
from app.utility.time import bd_now


router = APIRouter(prefix="/contact", tags=["contact"])


@router.get("/meta")
async def get_contact_meta(
	db: AsyncSession = Depends(get_db)
):
	try:
		result = await db.execute(
			text("""
				SELECT 
					email,
					phone,
					github_url,
					orcid_url,
					researchgate_url,
					google_scholar_url,
					cv_url,
					discord_url,
					linkedin_url,
					facebook_url,
					x_url,
					instagram_url
				FROM admin_info
				LIMIT 1
			""")
		)
		meta = result.mappings().first()
		if not meta:
			return {"message": "Contact meta not found"}
		return {"data": meta}
	except Exception as e:
		return {"message": f"Error retrieving contact meta: {str(e)}"}



@router.post("")
async def submit_contact_message(
	payload: CreateMessage,
	db: AsyncSession = Depends(get_db)
):
	try:
		response = await db.execute(
			text("""
				INSERT INTO contact_messages (name, email, message)
				VALUES (:name, :email, :message)
				RETURNING id
			"""),
			{"name": payload.name, "email": payload.email, "message": payload.message}
		)
		await db.commit()
		message_id = response.scalar()
		return {"message": "Contact message submitted successfully", "id": message_id}
	except Exception as e:
		await db.rollback()
		return {"message": f"Error submitting contact message: {str(e)}"}


@router.get("")
async def list_contact_messages(
	db: AsyncSession = Depends(get_db)
):
	try:
		result = await db.execute(
			text("""
				SELECT id, name, email, message, created_at
				FROM contact_messages
				ORDER BY created_at DESC
			""")
		)
		messages = []
		for row in result.mappings().all():
			row_dict = dict(row)
			if row_dict.get("created_at"):
				row_dict["created_at"] = bd_now(row_dict["created_at"])
			messages.append(row_dict)
		return {"data": messages}
	except Exception as e:
		return {"message": f"Error retrieving contact messages: {str(e)}"}


@router.get("/{message_id}")
async def get_contact_message(
	message_id: int,
	db: AsyncSession = Depends(get_db)
):
	try:
		result = await db.execute(
			text("""
				SELECT id, name, email, message, created_at
				FROM contact_messages
				WHERE id = :message_id
			"""),
			{"message_id": message_id}
		)
		message = result.mappings().first()
		if not message:
			return {"message": "Contact message not found"}
		message_dict = dict(message)
		if message_dict.get("created_at"):
			message_dict["created_at"] = bd_now(message_dict["created_at"])
		return {"data": message_dict}
	except Exception as e:
		return {"message": f"Error retrieving contact message: {str(e)}"}


@router.delete("/{message_id}")
async def delete_contact_message(
	message_id: int,
	db: AsyncSession = Depends(get_db)
):
	try:
		result = await db.execute(
			text("""
				DELETE FROM contact_messages
				WHERE id = :message_id
			"""),
			{"message_id": message_id}
		)
		await db.commit()
		return {"message": "Contact message deleted successfully"}
	except Exception as e:
		await db.rollback()
		return {"message": f"Error deleting contact message: {str(e)}"}
