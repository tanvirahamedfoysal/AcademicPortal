from fastapi import APIRouter

from .articles import router as articles_router
from .auth import router as auth_router
from .collaborators import router as collaborators_router
from .contact import router as contact_router
from .images import router as images_router
from .moderators import router as moderators_router
from .portfolio import router as portfolio_router
from .profile import router as profile_router
from .repository import router as repository_router
from .students import router as students_router
from .system import router as system_router
from .utility import router as utility_router


router = APIRouter()

router.include_router(articles_router)
router.include_router(auth_router)
router.include_router(collaborators_router)
router.include_router(contact_router)
router.include_router(images_router)
router.include_router(moderators_router)
router.include_router(portfolio_router)
router.include_router(profile_router)
router.include_router(repository_router)
router.include_router(students_router)
router.include_router(system_router)
router.include_router(utility_router)

__all__ = ["router"]
