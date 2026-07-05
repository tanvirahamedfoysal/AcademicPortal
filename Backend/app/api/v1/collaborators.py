from typing import Any

from fastapi import APIRouter

from app.db import engine
from app.utility import limiter


router = APIRouter(prefix="/collaborators", tags=["collaborators"])


@router.get("")
async def list_collaborators():
	return {"message": "Not implemented yet"}


@router.post("")
async def create_collaborator(payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.patch("/{collaborator_id}")
async def update_collaborator(collaborator_id: str, payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.delete("/{collaborator_id}")
async def delete_collaborator(collaborator_id: str):
	return {"message": "Not implemented yet"}

