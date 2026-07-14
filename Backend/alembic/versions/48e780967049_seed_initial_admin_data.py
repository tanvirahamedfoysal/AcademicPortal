"""seed initial admin data

Revision ID: 48e780967049
Revises: 1fbedeb75f8e
Create Date: 2026-07-14 12:50:40.250432

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy import text

from app.core import settings
from app.utility.auth import hash_password


# revision identifiers, used by Alembic.
revision: str = '48e780967049'
down_revision: Union[str, Sequence[str], None] = '1fbedeb75f8e'
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
    """Downgrade schema."""
    pass
