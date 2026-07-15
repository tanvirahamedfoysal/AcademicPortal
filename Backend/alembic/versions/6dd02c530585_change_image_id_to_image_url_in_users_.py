"""Change image_id to image_url in users table

Revision ID: 6dd02c530585
Revises: 0224651ef9b4
Create Date: 2026-07-16 04:17:12.022208

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6dd02c530585'
down_revision: Union[str, Sequence[str], None] = '0224651ef9b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add the new image_url column
    op.add_column('users', sa.Column('image_url', sa.Text(), nullable=True))
    
    # 2. Drop the index associated with image_id
    op.drop_index('ix_users_image_id', table_name='users')
    
    # 3. Drop the foreign key constraint
    # Note: 'users_image_id_fkey' is the standard naming convention PostgreSQL uses.
    # If your database used a custom name for this constraint, update the string below.
    op.drop_constraint('users_image_id_fkey', 'users', type_='foreignkey')
    
    # 4. Drop the old image_id column
    op.drop_column('users', 'image_id')


def downgrade() -> None:
    # 1. Add back the old image_id column
    op.add_column('users', sa.Column('image_id', sa.Integer(), nullable=True))
    
    # 2. Recreate the foreign key constraint
    op.create_foreign_key(
        'users_image_id_fkey', 
        source_table='users', 
        referent_table='assets', 
        local_cols=['image_id'], 
        remote_cols=['id'], 
        ondelete='SET NULL'
    )
    
    # 3. Recreate the index
    op.create_index('ix_users_image_id', 'users', ['image_id'], unique=False)
    
    # 4. Drop the newly added image_url column
    op.drop_column('users', 'image_url')
