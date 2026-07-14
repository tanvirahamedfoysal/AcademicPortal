"""Make Default Setup

Revision ID: 697f8f6c5051
Revises: 
Create Date: 2026-07-14 18:32:43.602662

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '697f8f6c5051'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Extensions & Functions
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # 2. Enums
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE account_role AS ENUM ('STUDENT', 'MODERATOR', 'ADMIN');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE account_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE otp_purpose AS ENUM ('REGISTER', 'PASSWORD_RESET');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE article_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    """)

    # 3. Tables
    op.execute("""
        CREATE TABLE IF NOT EXISTS assets (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL UNIQUE,
            public_id TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
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
        );
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            student_batch INTEGER NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS email_otps (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp VARCHAR(6) NOT NULL,
            purpose otp_purpose NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            is_used BOOLEAN NOT NULL DEFAULT FALSE,
            is_valid BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS collaborators (
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
        );
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS articles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            status article_status NOT NULL DEFAULT 'DRAFT',
            published_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            action TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS admin_info (
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
        );
    """)

    # 4. Indexes
    op.execute("CREATE INDEX IF NOT EXISTS ix_users_image_id ON users (image_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_collaborators_created_by ON collaborators (created_by);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_collaborators_updated_by ON collaborators (updated_by);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_articles_author_id ON articles (author_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_audit_logs_actor_id ON audit_logs (actor_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_email_otps_email_purpose ON email_otps (email, purpose);")

    # 5. Triggers
    op.execute("DROP TRIGGER IF EXISTS update_users_updated_at ON users;")
    op.execute("CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();")

    op.execute("DROP TRIGGER IF EXISTS update_students_updated_at ON students;")
    op.execute("CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();")

    op.execute("DROP TRIGGER IF EXISTS update_collaborators_updated_at ON collaborators;")
    op.execute("CREATE TRIGGER update_collaborators_updated_at BEFORE UPDATE ON collaborators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();")

    op.execute("DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;")
    op.execute("CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();")

    op.execute("DROP TRIGGER IF EXISTS update_admin_info_updated_at ON admin_info;")
    op.execute("CREATE TRIGGER update_admin_info_updated_at BEFORE UPDATE ON admin_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS admin_info CASCADE;")
    op.execute("DROP TABLE IF EXISTS audit_logs CASCADE;")
    op.execute("DROP TABLE IF EXISTS articles CASCADE;")
    op.execute("DROP TABLE IF EXISTS collaborators CASCADE;")
    op.execute("DROP TABLE IF EXISTS email_otps CASCADE;")
    op.execute("DROP TABLE IF EXISTS students CASCADE;")
    op.execute("DROP TABLE IF EXISTS users CASCADE;")
    op.execute("DROP TABLE IF EXISTS assets CASCADE;")
    op.execute("DROP TYPE IF EXISTS article_status;")
    op.execute("DROP TYPE IF EXISTS otp_purpose;")
    op.execute("DROP TYPE IF EXISTS account_status;")
    op.execute("DROP TYPE IF EXISTS account_role;")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;")
    