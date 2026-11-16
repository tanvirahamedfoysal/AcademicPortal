"""add is_alumni to students

Revision ID: 89db5617c919
Revises: 6614c9cbfc59
Create Date: 2026-11-16 20:43:55.531085

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '89db5617c919'
down_revision: Union[str, Sequence[str], None] = '6614c9cbfc59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the column with a server default so existing rows are automatically populated with false
    op.add_column(
        'students',
        sa.Column('is_alumni', sa.Boolean(), nullable=False, server_default=sa.text('false'))
    )


def downgrade() -> None:
    op.drop_column('students', 'is_alumni')
    