from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, bindparam

from app.db import get_db
from app.utility import limiter
from app.schema.v1.repository import DeleteResourcePayload
from app.utility.cloudinary import upload_asset, remove_asset


router = APIRouter(prefix="/repository", tags=["repository"])


@router.get("/documents")
async def list_repository_documents(
    db: AsyncSession = Depends(get_db),
):
    """Return all documents stored in the repository."""
    try:
        query = text(
            """
            SELECT id, name, url
            FROM assets;
            """
        )
        response = await db.execute(query)
        documents = response.mappings().all()
        return {"data": documents}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {exc}",
        ) from exc


@router.post("/documents", status_code=status.HTTP_201_CREATED)
async def create_repository_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    result = await upload_asset(file)
    try:
        query = text(
            """
            INSERT INTO assets (name, public_id, url)
            VALUES (:name, :public_id, :url)
            """
        )
        await db.execute(
            query,
            {
                "name": file.filename,
                "public_id": result["public_id"],
                "url": result["url"],
            },
        )
        await db.commit()
        return {"url": result["url"]}
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to insert asset into database",
        ) from exc


@router.delete("/documents", status_code=status.HTTP_204_NO_CONTENT)
async def delete_repository_document(
    payload: DeleteResourcePayload,
    db: AsyncSession = Depends(get_db),
):
    try:
        # 1. Fetch both public_id AND url from the database
        query = text("""
            SELECT public_id, url
            FROM assets
            WHERE url IN :urls
        """).bindparams(bindparam("urls", expanding=True))

        result = await db.execute(query, {"urls": payload.urls})
        rows = result.fetchall()

        if not rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No matching assets found for the provided URLs",
            )

        # Create a helper map to look up urls by their public_id
        asset_map = {row.public_id: row.url for row in rows}
        public_ids = list(asset_map.keys())

    except HTTPException:
        raise
    except Exception as e:
        print(f"Database lookup error: {e}")
        raise HTTPException(status_code=500, detail="Database lookup failed")

    deleted_from_cloudinary = []
    failed_cloudinary = []

    # 2. Delete from Cloudinary
    for p_id in public_ids:
        try:
            res = await remove_asset(p_id)
            if res.get("result") == "ok" or res.get("result") == "not found":
                deleted_from_cloudinary.append(p_id)
            else:
                failed_cloudinary.append(p_id)
        except Exception as cloud_err:
            print(f"Cloudinary delete failed for {p_id}: {cloud_err}")
            failed_cloudinary.append(p_id)

    # 3. Clean up successfully deleted records from the DB
    if deleted_from_cloudinary:
        try:
            delete_query = text("""
                DELETE FROM assets
                WHERE public_id IN :deleted_ids
            """).bindparams(bindparam("deleted_ids", expanding=True))
            await db.execute(delete_query, {"deleted_ids": deleted_from_cloudinary})
            await db.commit()
        except Exception as db_err:
            await db.rollback()
            print(f"Database row deletion failed: {db_err}")
            raise HTTPException(
                status_code=500,
                detail="Cloudinary cleared but DB tracking update failed",
            )

    # 4. Map the failed public_ids back to their database URLs
    not_deleted_urls = [asset_map[p_id] for p_id in failed_cloudinary]

    return {
        "message": "Images deletion processing complete.",
        "not_deleted_urls": not_deleted_urls,
    }
