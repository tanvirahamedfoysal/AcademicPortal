from typing import Any

from fastapi import APIRouter


router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("/public")
async def list_public_articles():
	return {"message": "Not implemented yet"}


@router.get("/public/{article_id}")
async def get_public_article(article_id: str):
	return {"message": "Not implemented yet"}


@router.get("")
async def list_articles(status: str | None = None):
	return {"message": "Not implemented yet"}


@router.get("/{article_id}")
async def get_article(article_id: str):
	return {"message": "Not implemented yet"}


@router.post("")
async def create_article(payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.patch("/{article_id}")
async def update_article(article_id: str, payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.patch("/{article_id}/status")
async def update_article_status(article_id: str, payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.delete("/{article_id}")
async def delete_article(article_id: str):
	return {"message": "Not implemented yet"}

