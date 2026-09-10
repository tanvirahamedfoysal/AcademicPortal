from sqlalchemy import text
from time import perf_counter
from fastapi import APIRouter, Request

from app.db import engine
from app.utility import limiter


router = APIRouter(prefix="/utility", tags=["utility"])

@router.get("/health")
@limiter.limit("5/minute")
async def db_debug(request: Request):
    t1 = perf_counter()
    async with engine.connect() as conn:
        t2 = perf_counter()
        await conn.execute(text("SELECT 1"))
        t3 = perf_counter()
    return {
        "connect_time": round(t2 - t1, 3),
        "query_time": round(t3 - t2, 3),
        "total_time": round(t3 - t1, 3),
    }