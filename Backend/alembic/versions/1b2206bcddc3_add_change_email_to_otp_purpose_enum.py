"""add change_email to otp_purpose enum

Revision ID: 1b2206bcddc3
Revises: 6dd02c530585
Create Date: 2026-07-23 22:24:06.882586

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b2206bcddc3'
down_revision: Union[str, Sequence[str], None] = '6dd02c530585'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("COMMIT")
    op.execute("ALTER TYPE otp_purpose ADD VALUE IF NOT EXISTS 'CHANGE_EMAIL'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
