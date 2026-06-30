from sqlalchemy import text
from time import perf_counter
from fastapi import APIRouter
from db import engine

router = APIRouter(prefix="/api/v1/utility", tags=["utility"])


@router.get("/health")
async def db_debug():
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