from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

from app.core import settings
from app.utility.auth import hash_password

REQUIRED_TABLES = [
    "assets",
    "users",
    "students",
    "email_otps",
    "collaborators",
    "articles",
    "audit_logs",
    "admin_info",
]

async def verify_schema(connection: AsyncConnection) -> None:
    result = await connection.execute(
        text("""
            SELECT table_name
            FROM unnest(CAST(:table_names AS text[])) AS table_name
            WHERE to_regclass('public.' || table_name) IS NULL
        """),
        {"table_names": REQUIRED_TABLES},
    )

    missing_tables = list(result.scalars())
    if missing_tables:
        raise RuntimeError(
            f"Database schema is incomplete: {', '.join(missing_tables)}"
        )

async def seed_admin(connection: AsyncConnection) -> None:
    await connection.execute(
        text("""
            INSERT INTO users (
                name,
                username,
                email,
                hashed_password,
                role,
                status
            )
            VALUES (
                :name,
                :username,
                :email,
                :hashed_password,
                CAST('ADMIN' AS account_role),
                CAST('ACTIVE' AS account_status)
            )
            ON CONFLICT (username) DO NOTHING
        """),
        {
            "name": settings.admin_name,
            "username": settings.admin_username,
            "email": settings.admin_email,
            "hashed_password": hash_password(settings.admin_password),
        },
    )

async def seed_admin_info(connection: AsyncConnection) -> None:
    await connection.execute(
        text("""
            INSERT INTO admin_info (id)
            VALUES (1)
            ON CONFLICT (id) DO NOTHING
        """)
    )