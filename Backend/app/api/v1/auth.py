from fastapi import APIRouter

from app.db import engine
from app.utility import limiter
from app.schema.v1.auth import UserRegister, ValidateUsername, RequestOTP, UserLogin


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(payload: UserLogin):
	return {"message": "Not implemented yet"}


@router.get("/validate-username")
async def validate_username(payload: ValidateUsername):
	return {"message": "Not implemented yet"}


@router.post("/register/request-otp")
async def request_registration_otp(payload: RequestOTP):
	return {"message": "Not implemented yet"}


@router.post("/register")
async def register_student(payload: UserRegister):
	return {"message": "Not implemented yet"}


@router.post("/password-reset/request-otp")
async def request_password_reset_otp(payload: RequestOTP):
	return {"message": "Not implemented yet"}


@router.patch("/password-reset")
async def reset_password(payload: RequestOTP):
	return {"message": "Not implemented yet"}

