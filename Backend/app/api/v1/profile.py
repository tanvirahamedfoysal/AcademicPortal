from typing import Any

from fastapi import APIRouter

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me")
async def get_me():
	return {"message": "Not implemented yet"}


@router.patch("/me")
async def update_me(payload: dict[str, Any]):
	return {"message": "Not implemented yet"}

