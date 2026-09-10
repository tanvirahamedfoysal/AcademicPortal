"""update audit_logs actor_id to reference user uuid

Revision ID: e6802ad1408f
Revises: 0aca6224a92b
Create Date: 2026-09-10 22:29:42.146020

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6802ad1408f'
down_revision: Union[str, Sequence[str], None] = '0aca6224a92b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Add the temporary UUID column
    op.execute("ALTER TABLE audit_logs ADD COLUMN new_actor_id UUID;")
    
    # 2. Populate it by joining the current integer ID with the users table
    op.execute("""
        UPDATE audit_logs 
        SET new_actor_id = users.uuid 
        FROM users 
        WHERE audit_logs.actor_id = users.id;
    """)
    
    # 3. Drop the old foreign key constraint
    op.execute("ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey;")
    
    # 4. Drop the old integer column
    op.execute("ALTER TABLE audit_logs DROP COLUMN actor_id;")
    
    # 5. Rename the new UUID column to actor_id
    op.execute("ALTER TABLE audit_logs RENAME COLUMN new_actor_id TO actor_id;")
    
    # 6. Apply the new foreign key constraint
    op.execute("""
        ALTER TABLE audit_logs 
        ADD CONSTRAINT audit_logs_actor_id_fkey 
        FOREIGN KEY (actor_id) REFERENCES users(uuid) ON DELETE SET NULL;
    """)



def downgrade() -> None:
    """Downgrade schema."""
    pass
