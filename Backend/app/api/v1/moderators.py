from typing import Any

from fastapi import APIRouter

from app.db import engine
from app.utility import limiter


router = APIRouter(prefix="/moderators", tags=["moderators"])


@router.get("")
async def list_moderators():
	return {"message": "Not implemented yet"}


@router.get("/{uuid}")
async def get_moderator(uuid: str):
	return {"message": "Not implemented yet"}


@router.post("/{uuid}")
async def create_moderator(uuid: str):
	return {"message": "Not implemented yet"}


@router.delete("/{uuid}")
async def delete_moderator(uuid: str):
	return {"message": "Not implemented yet"}

