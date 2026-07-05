from fastapi import APIRouter


router = APIRouter(prefix="/system", tags=["system"])


@router.get("/audit-logs")
async def get_audit_logs():
	return {"message": "Not implemented yet"}

