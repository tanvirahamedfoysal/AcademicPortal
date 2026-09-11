"""update assets, add assets type column

Revision ID: 6614c9cbfc59
Revises: a6df9e6c8770
Create Date: 2026-09-11 11:09:36.163725

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6614c9cbfc59'
down_revision: Union[str, Sequence[str], None] = 'a6df9e6c8770'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("ALTER TABLE assets ADD COLUMN asset_type TEXT;")

def downgrade():
    op.execute("ALTER TABLE assets DROP COLUMN asset_type;")

