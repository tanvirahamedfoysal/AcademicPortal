"""Update collaborator table

Revision ID: 0224651ef9b4
Revises: 5068732384b1
Create Date: 2026-07-16 01:52:17.521162

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0224651ef9b4'
down_revision: Union[str, Sequence[str], None] = '5068732384b1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Drop the foreign key constraint on the old column
    # Note: If the table was never actually created, you can skip dropping and just alter columns.
    # Otherwise, PostgreSQL automatically names the FK constraint "collaborators_image_id_fkey"
    op.drop_constraint('collaborators_image_id_fkey', 'collaborators', type_='foreignkey')
    
    # 2. Drop the old column
    op.drop_column('collaborators', 'image_id')
    
    # 3. Add the new image_url column
    op.add_column('collaborators', sa.Column('image_url', sa.Text(), nullable=True))


def downgrade() -> None:
    # Reverse the process:
    # 1. Drop the newly added image_url column
    op.drop_column('collaborators', 'image_url')
    
    # 2. Re-create the image_id column
    op.add_column('collaborators', sa.Column('image_id', sa.Integer(), nullable=True))
    
    # 3. Re-apply the foreign key constraint to assets(id)
    op.create_foreign_key(
        'collaborators_image_id_fkey',
        source_table='collaborators',
        referent_table='assets',
        local_cols=['image_id'],
        remote_cols=['id'],
        ondelete='SET NULL'
    )