from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.utility import limiter
from app.utility.time import bd_now
from app.core.config import settings
from app.schema.v1.collaborators import CollaboratorCreate, CollaboratorUpdate


router = APIRouter(prefix="/collaborators", tags=["collaborators"])


@router.get("")
async def list_collaborators(db: AsyncSession = Depends(get_db)):
    try:
        response = await db.execute(
            text("""
				SELECT 
					id AS uuid, name,
					COALESCE(image_url, :default_image) AS image_url
				FROM 
                    collaborators
				ORDER BY 
                    name DESC
			"""),
            {"default_image": settings.default_profile_image_url},
        )
        result = response.mappings().all()
        return {"data": result}
    except Exception as e:
        return {"message": f"Error retrieving collaborators: {str(e)}"}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_collaborator(
    payload: CollaboratorCreate, db: AsyncSession = Depends(get_db)
):
    try:
        image_url = payload.image_url or settings.default_profile_image_url
        response = await db.execute(
            text("""
				INSERT INTO 
                    collaborators (name, bio, organization, website_url, image_url)
				VALUES 
                    (:name, :bio, :organization, :website_url, :image_url)
				RETURNING 
                    id as uuid
			"""),
            {
                "name": payload.name,
                "bio": payload.bio,
                "organization": payload.organization,
                "website_url": payload.website_url,
                "image_url": image_url,
            },
        )
        result = response.mappings().first()
        await db.commit()
        return {"data": result}
    except Exception as e:
        await db.rollback()
        return {"message": f"Error creating collaborator: {str(e)}"}


@router.patch("/{uuid}", status_code=status.HTTP_202_ACCEPTED)
async def update_collaborator(
    uuid: str, payload: CollaboratorUpdate, db: AsyncSession = Depends(get_db)
):
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided for update",
        )

    try:
        # 2. Build the dynamic SET clause safely
        set_clauses = [f"{key} = :{key}" for key in update_data.keys()]

        # Ensure updated_at is always refreshed on modifications
        set_clauses.append("updated_at = NOW()")
        set_query_part = ", ".join(set_clauses)

        # 3. Add the uuid to the query parameters
        query_params = {**update_data, "uuid": uuid}

        # 4. Execute the update
        response = await db.execute(
            text(f"""
				UPDATE 
                    collaborators
				SET 
                    {set_query_part}
				WHERE 
                    id = :uuid
				RETURNING 
                    id AS uuid, name, bio, organization, website_url, image_url, updated_at
			"""),
            query_params,
        )

        result = response.mappings().first()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Collaborator not found"
            )

        await db.commit()
        return {"data": result}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating collaborator: {str(e)}",
        )


@router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collaborator(uuid: str, db: AsyncSession = Depends(get_db)):
    try:
        # 1. Execute the DELETE query and check if a row was affected
        response = await db.execute(
            text("""
				DELETE FROM 
                    collaborators
				WHERE 
                    id = :uuid
				RETURNING id
			"""),
            {"uuid": uuid},
        )

        # 2. Check if any row was actually deleted
        deleted_row = response.fetchone()

        if not deleted_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Collaborator not found"
            )

        # 3. Commit the transaction
        await db.commit()
        return {"message": "Collaborator deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting collaborator: {str(e)}",
        )
