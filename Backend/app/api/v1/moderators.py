from typing import Any

from fastapi import APIRouter

from app.db import engine
from app.utility import limiter


router = APIRouter(prefix="/moderators", tags=["moderators"])


@router.get("")
async def list_moderators():
	return {"message": "Not implemented yet"}


@router.get("/{moderator_id}")
async def get_moderator(moderator_id: str):
	return {"message": "Not implemented yet"}


@router.post("")
async def create_moderator(payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.delete("/{moderator_id}")
async def delete_moderator(moderator_id: str):
	return {"message": "Not implemented yet"}

