"""Update table name contact to contact_messages

Revision ID: 5068732384b1
Revises: 55b0eb00ecb0
Create Date: 2026-07-16 01:21:40.213480

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5068732384b1'
down_revision: Union[str, Sequence[str], None] = '55b0eb00ecb0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.rename_table('contact', 'contact_messages')


def downgrade() -> None:
    op.rename_table('contact_messages', 'contact')
