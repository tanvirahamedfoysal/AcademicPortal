from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import text, bindparam
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.utility import limiter
from app.utility.cloudinary import upload_asset, remove_asset
from app.schema.v1.images import DeleteImagesPayload

router = APIRouter(prefix="/images", tags=["images"])


@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    result = await upload_asset(file)
    try: 
        query = text("""
			INSERT INTO assets (name, public_id, url)
			VALUES (:name, :public_id, :url)
		""")
        await db.execute(query, {"name": file.filename, "public_id": result["public_id"], "url": result["url"]})
        await db.commit()
        return {
			"url": result["url"],
		}
    except Exception as e:
        await db.rollback()
        print(f"Database insertion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to insert asset into database")
	

@router.delete("")
async def delete_images(
    payload: DeleteImagesPayload,
    db: AsyncSession = Depends(get_db)
):
    try:
        query = text("""
            SELECT public_id, url
            FROM assets
            WHERE url IN :urls
        """).bindparams(
            bindparam("urls", expanding=True)
        )
        
        result = await db.execute(query, {"urls": payload.urls})
        rows = result.fetchall()
        
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="No matching assets found for the provided URLs"
            )
            
        public_ids = [row.public_id for row in rows]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Database lookup error: {e}")
        raise HTTPException(status_code=500, detail="Database lookup failed")

    deleted_from_cloudinary = []
    failed_cloudinary = []

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

    if deleted_from_cloudinary:
        try:
            delete_query = text("""
                DELETE FROM assets
                WHERE public_id IN :deleted_ids
            """).bindparams(
                bindparam("deleted_ids", expanding=True)
            )
            await db.execute(delete_query, {"deleted_ids": deleted_from_cloudinary})
            await db.commit()
        except Exception as db_err:
            await db.rollback()
            print(f"Database row deletion failed: {db_err}")
            raise HTTPException(status_code=500, detail="Cloudinary cleared but DB tracking update failed")

    return {
        "message": "Images deletion processing complete.",
        "failed_or_skipped": failed_cloudinary
    }