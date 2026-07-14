import time
import uvicorn
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api import router
from app.core import settings, async_init_settings
from app.utility import limiter
from app.db.database import engine
from app.db.startup import verify_schema, seed_admin, seed_admin_info


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await async_init_settings()
        async with engine.begin() as connection:
            await verify_schema(connection)
            await seed_admin(connection)
            await seed_admin_info(connection)
        print(f"🚀 Starting {settings.api_title}")
        yield
    finally:
        await engine.dispose()
        print(f"🛑 Shutting down {settings.api_title}")

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=settings.api_description,
    debug=settings.debug,
    lifespan=lifespan,
)


app.state.limiter = limiter
app.add_exception_handler( RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SlowAPIMiddleware)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{time.perf_counter() - start:.6f}"
    return response

if not settings.debug:
    app.add_middleware(HTTPSRedirectMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router, prefix="/api")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
