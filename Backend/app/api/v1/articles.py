from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.utility import limiter
from app.utility.time import bd_now
from app.utility.auth import verify_token, validate_user_access
from app.schema.v1.articles import ArticleCreate, ArticleUpdate, ArticleStatusUpdate


router = APIRouter(prefix="/articles", tags=["articles"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


@router.get("/public")
async def list_public_articles(db: AsyncSession = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                a.id AS article_uuid, 
                a.title AS article_title, 
                a.published_at AS published_at, 
                a.updated_at AS updated_at,
                u.uuid AS author_uuid
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.status = 'PUBLISHED'
            ORDER BY a.published_at DESC
        """)
        result = await db.execute(query)
        return {"data": result.mappings().all()}
    except Exception as e:
        print(f"Error fetching public articles: {e}")
        raise HTTPException(status_code=500, detail="Error fetching public articles")


@router.get("/public/{article_id}")
async def get_public_article(article_id: str, db: AsyncSession = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                a.id AS article_uuid, 
                a.title AS article_title, 
                a.body AS article_body, 
                a.published_at AS published_at, 
                a.updated_at AS updated_at,
                u.uuid AS author_uuid
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.id = CAST(:id AS UUID) AND a.status = 'PUBLISHED'
        """)
        result = await db.execute(query, {"id": article_id})
        article = result.mappings().first()

        if not article:
            raise HTTPException(
                status_code=404, detail="Article not found or not published"
            )
        return {"data": article}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid article ID format")


@router.get("")
async def list_articles(
    status: str | None = None,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    auth = validate_user_access(token)
    if not auth["is_valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        # Build query dynamically based on whether status is provided
        base_query = """
            SELECT 
                a.id AS article_uuid, 
                a.title AS article_title, 
                a.status AS article_status, 
                a.created_at AS created_at, 
                a.updated_at AS updated_at
            FROM articles a
            JOIN users u ON a.author_id = u.id
            WHERE u.uuid = CAST(:user_uuid AS UUID)
        """
        params = {"user_uuid": auth["data"]["uuid"]}

        if status:
            base_query += " AND a.status = CAST(:status AS article_status)"
            params["status"] = status

        base_query += " ORDER BY a.created_at DESC"

        result = await db.execute(text(base_query), params)
        return {"data": result.mappings().all()}
    except Exception:
        raise HTTPException(status_code=500, detail="Error fetching your articles")


@router.get("/{article_id}")
async def get_article(
    article_id: str,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    auth = validate_user_access(token)
    if not auth["is_valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        query = text("""
            SELECT a.*, u.uuid AS author_uuid
            FROM articles a
            JOIN users u ON a.author_id = u.id
            WHERE a.id = CAST(:id AS UUID) AND u.uuid = CAST(:user_uuid AS UUID)
        """)
        result = await db.execute(
            query, {"id": article_id, "user_uuid": auth["data"]["uuid"]}
        )
        article = result.mappings().first()

        if not article:
            raise HTTPException(
                status_code=404, detail="Article not found or unauthorized"
            )
        return {"data": article}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid article ID format")


@router.post("")
async def create_article(
    payload: ArticleCreate,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    auth = validate_user_access(token)
    if not auth["is_valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        query = text("""
            INSERT INTO articles (author_id, title, body)
            VALUES (
                (SELECT id FROM users WHERE uuid = CAST(:user_uuid AS UUID)), 
                :title, 
                :body
            )
            RETURNING id, title, status, created_at
        """)
        result = await db.execute(
            query,
            {
                "user_uuid": auth["data"]["uuid"],
                "title": payload.title,
                "body": payload.body,
            },
        )
        await db.commit()
        return {
            "message": "Article created successfully",
            "data": result.mappings().first(),
        }
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")


@router.patch("/{article_id}")
async def update_article(
    article_id: str,
    payload: ArticleUpdate,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    auth = validate_user_access(token)
    if not auth["is_valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=400, detail="No valid fields provided for update"
        )

    try:
        set_clauses = [f"{k} = :{k}" for k in update_data.keys()]
        set_clauses.append("updated_at = NOW()")
        set_query = ", ".join(set_clauses)

        query = text(f"""
            UPDATE articles a
            SET {set_query}
            FROM users u
            WHERE a.author_id = u.id 
              AND a.id = CAST(:id AS UUID) 
              AND u.uuid = CAST(:user_uuid AS UUID)
            RETURNING a.id, a.title, a.updated_at
        """)

        params = {"id": article_id, "user_uuid": auth["data"]["uuid"], **update_data}
        result = await db.execute(query, params)
        await db.commit()

        updated_article = result.mappings().first()
        if not updated_article:
            raise HTTPException(
                status_code=404, detail="Article not found or unauthorized"
            )

        return {"message": "Article updated successfully", "data": updated_article}
    except HTTPException:
        raise
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")


@router.patch("/{article_id}/status")
async def update_article_status(
    article_id: str,
    payload: ArticleStatusUpdate,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    auth = validate_user_access(token)
    if not auth["is_valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        # If status is PUBLISHED, we also set published_at. Otherwise, keep it as is or nullify.
        published_clause = (
            "published_at = NOW()," if payload.status.upper() == "PUBLISHED" else ""
        )

        query = text(f"""
            UPDATE articles a
            SET status = CAST(:status AS article_status), 
                {published_clause}
                updated_at = NOW()
            FROM users u
            WHERE a.author_id = u.id 
              AND a.id = CAST(:id AS UUID) 
              AND u.uuid = CAST(:user_uuid AS UUID)
            RETURNING a.id, a.status, a.published_at
        """)

        result = await db.execute(
            query,
            {
                "id": article_id,
                "user_uuid": auth["data"]["uuid"],
                "status": payload.status.upper(),
            },
        )
        await db.commit()

        updated_article = result.mappings().first()
        if not updated_article:
            raise HTTPException(
                status_code=404, detail="Article not found or unauthorized"
            )

        return {
            "message": f"Article status updated to {payload.status}",
            "data": updated_article,
        }
    except HTTPException:
        raise
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Database error occurred. Verify status value is valid.",
        )


@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    auth = validate_user_access(token)
    if not auth["is_valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        query = text("""
            DELETE FROM articles a
            USING users u
            WHERE a.author_id = u.id 
              AND a.id = CAST(:id AS UUID) 
              AND u.uuid = CAST(:user_uuid AS UUID)
            RETURNING a.id
        """)
        result = await db.execute(
            query, {"id": article_id, "user_uuid": auth["data"]["uuid"]}
        )
        await db.commit()

        deleted_article = result.scalar_one_or_none()
        if not deleted_article:
            raise HTTPException(
                status_code=404, detail="Article not found or unauthorized"
            )

        return {"message": "Article deleted successfully"}
    except HTTPException:
        raise
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")


@router.get("/{article_id}/last-update")
async def get_article_last_update(article_id: str, db: AsyncSession = Depends(get_db)):
    try:
        query = text("SELECT updated_at FROM articles WHERE id = CAST(:id AS UUID)")
        result = await db.execute(query, {"id": article_id})

        last_updated = result.scalar_one_or_none()
        if not last_updated:
            raise HTTPException(status_code=404, detail="Article not found")

        return {"last_updated_at": last_updated.isoformat()}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid article ID format")
