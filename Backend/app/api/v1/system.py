from fastapi import APIRouter

from app.db import engine
from app.utility import limiter


router = APIRouter(prefix="/system", tags=["system"])


@router.get("/audit-logs")
async def get_audit_logs():
	return {"message": "Not implemented yet"}

