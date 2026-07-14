"""Seed Initial Admin Data

Revision ID: 0c4af57dc788
Revises: 697f8f6c5051
Create Date: 2026-07-14 18:33:34.453374

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy import text

from app.core import settings
from app.utility.auth import hash_password


# revision identifiers, used by Alembic.
revision: str = '0c4af57dc788'
down_revision: Union[str, Sequence[str], None] = '697f8f6c5051'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()
    connection.execute(
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
    connection.execute(
        text("""
            INSERT INTO admin_info (id, email)
            VALUES (1, :email)
            ON CONFLICT (id) DO NOTHING
        """),
        {"email": settings.admin_email},
    )


def downgrade() -> None:
    connection = op.get_bind()
    connection.execute(
        text("DELETE FROM admin_info WHERE id = 1;")
    )
    connection.execute(
        text("DELETE FROM users WHERE username = :username;"),
        {"username": settings.admin_username}
    )