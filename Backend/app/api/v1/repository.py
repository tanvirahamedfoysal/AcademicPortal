from typing import Any

from fastapi import APIRouter

from app.db import engine
from app.utility import limiter


router = APIRouter(prefix="/repository", tags=["repository"])


@router.get("/documents")
async def list_repository_documents():
	return {"message": "Not implemented yet"}


@router.get("/documents/{document_id}")
async def get_repository_document(document_id: str):
	return {"message": "Not implemented yet"}


@router.post("/documents")
async def create_repository_document(payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.patch("/documents/{document_id}")
async def update_repository_document(document_id: str, payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.delete("/documents/{document_id}")
async def delete_repository_document(document_id: str):
	return {"message": "Not implemented yet"}

