from typing import Any

from fastapi import APIRouter

from app.db import engine
from app.utility import limiter


router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("")
async def get_portfolio():
	return {"message": "Not implemented yet"}


@router.put("")
async def replace_portfolio(payload: dict[str, Any]):
	return {"message": "Not implemented yet"}

