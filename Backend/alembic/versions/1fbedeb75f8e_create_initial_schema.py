"""create initial schema

Revision ID: 1fbedeb75f8e
Revises: 
Create Date: 2026-07-14 12:08:24.354300

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1fbedeb75f8e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.execute("""
        CREATE TYPE account_role AS ENUM ('STUDENT', 'MODERATOR', 'ADMIN')
    """)
    op.execute("""
        CREATE TYPE account_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED')
    """)
    op.execute("""
        CREATE TYPE otp_purpose AS ENUM ('REGISTER', 'PASSWORD_RESET')
    """)
    op.execute("""
        CREATE TYPE article_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED')
    """)

    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
    """)

    op.execute("""
        CREATE TABLE assets (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL UNIQUE,
            public_id TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            bio TEXT,
            email TEXT NOT NULL UNIQUE,
            mobile_number TEXT,
            hashed_password TEXT NOT NULL,
            role account_role NOT NULL DEFAULT 'STUDENT',
            status account_status NOT NULL DEFAULT 'PENDING',
            image_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
            address TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE TABLE students (
            id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            student_batch INTEGER NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE TABLE email_otps (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp VARCHAR(6) NOT NULL,
            purpose otp_purpose NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            is_used BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE TABLE collaborators (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            bio TEXT,
            organization TEXT,
            website_url TEXT,
            image_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
            created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE TABLE articles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            status article_status NOT NULL DEFAULT 'DRAFT',
            published_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE TABLE audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            action TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE TABLE admin_info (
            id SMALLINT PRIMARY KEY DEFAULT 1,
            school TEXT,
            college TEXT,
            public_bio TEXT,
            research_description TEXT,
            research_interests TEXT[],
            email TEXT,
            phone TEXT,
            github_url TEXT,
            orcid_url TEXT,
            researchgate_url TEXT,
            google_scholar_url TEXT,
            cv_url TEXT,
            discord_url TEXT,
            linkedin_url TEXT,
            facebook_url TEXT,
            x_url TEXT,
            instagram_url TEXT,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT admin_info_singleton_chk CHECK (id = 1)
        )
    """)

    op.execute("CREATE INDEX ix_users_image_id ON users (image_id)")
    op.execute(
        "CREATE INDEX ix_collaborators_created_by ON collaborators (created_by)"
    )
    op.execute(
        "CREATE INDEX ix_collaborators_updated_by ON collaborators (updated_by)"
    )
    op.execute("CREATE INDEX ix_articles_author_id ON articles (author_id)")
    op.execute("CREATE INDEX ix_audit_logs_actor_id ON audit_logs (actor_id)")
    op.execute(
        "CREATE INDEX ix_email_otps_email_purpose ON email_otps (email, purpose)"
    )

    op.execute("""
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    """)

    op.execute("""
        CREATE TRIGGER update_students_updated_at
        BEFORE UPDATE ON students
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    """)

    op.execute("""
        CREATE TRIGGER update_collaborators_updated_at
        BEFORE UPDATE ON collaborators
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    """)

    op.execute("""
        CREATE TRIGGER update_articles_updated_at
        BEFORE UPDATE ON articles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    """)

    op.execute("""
        CREATE TRIGGER update_admin_info_updated_at
        BEFORE UPDATE ON admin_info
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    """)


def downgrade() -> None:
    op.drop_table("admin_info")
    op.drop_table("audit_logs")
    op.drop_table("articles")
    op.drop_table("collaborators")
    op.drop_table("email_otps")
    op.drop_table("students")
    op.drop_table("users")
    op.drop_table("assets")

    op.execute("DROP TYPE article_status")
    op.execute("DROP TYPE otp_purpose")
    op.execute("DROP TYPE account_status")
    op.execute("DROP TYPE account_role")

    op.execute("DROP FUNCTION update_updated_at_column")
