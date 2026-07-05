from typing import Any

from fastapi import APIRouter


router = APIRouter(prefix="/students", tags=["students"])


@router.get("/pending")
async def list_pending_students():
	return {"message": "Not implemented yet"}


@router.get("/pending/{student_id}")
async def get_pending_student(student_id: str):
	return {"message": "Not implemented yet"}


@router.delete("/pending/{student_id}")
async def delete_pending_student(student_id: str):
	return {"message": "Not implemented yet"}


@router.patch("/pending/{student_id}/verify")
async def verify_pending_student(student_id: str):
	return {"message": "Not implemented yet"}


@router.get("")
async def list_students():
	return {"message": "Not implemented yet"}


@router.get("/{student_id}")
async def get_student(student_id: str):
	return {"message": "Not implemented yet"}


@router.patch("/{student_id}")
async def update_student(student_id: str, payload: dict[str, Any]):
	return {"message": "Not implemented yet"}


@router.delete("/{student_id}")
async def delete_student(student_id: str):
	return {"message": "Not implemented yet"}

