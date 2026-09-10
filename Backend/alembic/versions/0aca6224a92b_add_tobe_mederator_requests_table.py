"""Add tobe_mederator_requests table

Revision ID: 0aca6224a92b
Revises: 1b2206bcddc3
Create Date: 2026-07-24 01:05:27.037568

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0aca6224a92b'
down_revision: Union[str, Sequence[str], None] = '1b2206bcddc3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Execute raw SQL to create the table
    op.execute("""
        CREATE TABLE tobe_moderator_requests (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    
    # Execute raw SQL to create the index
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_tobe_moderator_requests_user_id 
        ON tobe_moderator_requests (user_id);
    """)


def downgrade() -> None:
    # Execute raw SQL to drop the index
    op.execute("""
        DROP INDEX IF EXISTS ix_tobe_moderator_requests_user_id;
    """)
    
    # Execute raw SQL to drop the table
    op.execute("""
        DROP TABLE IF EXISTS tobe_moderator_requests;
    """)
