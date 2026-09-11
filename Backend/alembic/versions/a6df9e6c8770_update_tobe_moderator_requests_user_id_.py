"""update tobe_moderator_requests user_id to reference user uuid

Revision ID: a6df9e6c8770
Revises: e6802ad1408f
Create Date: 2026-09-10 22:41:43.335960

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a6df9e6c8770'
down_revision: Union[str, Sequence[str], None] = 'e6802ad1408f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Add the temporary UUID column
    op.execute("ALTER TABLE tobe_moderator_requests ADD COLUMN new_user_id UUID;")
    
    # 2. Populate it by joining the current integer ID with the users table
    op.execute("""
        UPDATE tobe_moderator_requests 
        SET new_user_id = users.uuid 
        FROM users 
        WHERE tobe_moderator_requests.user_id = users.id;
    """)
    
    # 3. Drop the old foreign key constraint
    # (Check your database if the constraint name differs, but this is the default)
    op.execute("ALTER TABLE tobe_moderator_requests DROP CONSTRAINT IF EXISTS tobe_moderator_requests_user_id_fkey;")
    
    # 4. Drop the old integer column
    op.execute("ALTER TABLE tobe_moderator_requests DROP COLUMN user_id;")
    
    # 5. Rename the new UUID column to user_id
    op.execute("ALTER TABLE tobe_moderator_requests RENAME COLUMN new_user_id TO user_id;")
    
    # 6. Apply the new foreign key constraint pointing to users(uuid)
    op.execute("""
        ALTER TABLE tobe_moderator_requests 
        ADD CONSTRAINT tobe_moderator_requests_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE;
    """)


def downgrade() -> None:
    """Downgrade schema."""
    pass
