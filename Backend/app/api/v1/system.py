from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db
from app.utility import limiter


router = APIRouter(prefix="/system", tags=["system"])


@router.get("/audit-logs")
async def get_audit_logs(
    db: AsyncSession = Depends(get_db)
):
    try:
        query = text("""
                       SELECT
				actor_id, action, created_at
                       FROM
				audit_logs
			ORDER BY
				created_at DESC;
		""")
        response = await db.execute(query)
        audit_logs = response.mappings().all()
        return {"audit_logs": audit_logs}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving audit-logs: {str(e)}",
        )
