from fastapi import APIRouter

from .utility import router as utility_router


router = APIRouter()

router.include_router(utility_router)

__all__ = [
    "router"
]