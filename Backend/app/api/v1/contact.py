from typing import Any

from fastapi import APIRouter

from app.db import engine
from app.utility import limiter


router = APIRouter(prefix="/contact", tags=["contact"])


@router.get("/meta")
async def get_contact_meta():
	return {"message": "Not implemented yet"}


@router.post("")
async def submit_contact_message(payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.get("")
async def list_contact_messages():
	return {"message": "Not implemented yet"}


@router.get("/{message_id}")
async def get_contact_message(message_id: str):
	return {"message": "Not implemented yet"}


@router.delete("/{message_id}")
async def delete_contact_message(message_id: str):
	return {"message": "Not implemented yet"}

