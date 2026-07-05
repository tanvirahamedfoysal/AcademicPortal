from typing import Any

from fastapi import APIRouter


router = APIRouter(prefix="/images", tags=["images"])


@router.post("")
async def upload_image(payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.delete("")
async def delete_images(payload: dict[str, list[str]]):
	return {"message": "Not implemented yet"}

