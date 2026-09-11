from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.utility import limiter
from app.schema.v1.portfolio import AdminInfoUpdate

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("")
async def get_portfolio(
    db: AsyncSession = Depends(get_db)
):
    try:
        query = text("""
            SELECT 
                school, college, public_bio, research_description, research_interests,
                email, phone, github_url, orcid_url, researchgate_url, google_scholar_url,
                cv_url, discord_url, linkedin_url, facebook_url, x_url, instagram_url,
                updated_at
            FROM 
                admin_info
            WHERE 
                id = 1
        """)
        result = await db.execute(
            query
        )
        portfolio = result.mappings().first()
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio metadata has not been initialized.",
            )
        return {"data": portfolio}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving portfolio metadata: {str(e)}",
        )


@router.put("")
async def replace_portfolio(
    payload: AdminInfoUpdate, 
    db: AsyncSession = Depends(get_db)
):
    # Dump all fields (including None/null) to perform a full REPLACE operation
    update_data = payload.model_dump()

    try:
        # Build a dynamic SET query to replace all database columns
        # e.g., ["school = :school", "college = :college", ...]
        set_clauses = [f"{key} = :{key}" for key in update_data.keys()]
        set_clauses.append("updated_at = NOW()")
        set_query_part = ", ".join(set_clauses)

        query_params = {**update_data}

        # We target 'id = 1' specifically because of the check constraint.
        # If the row doesn't exist, we fallback to an UPSERT block.
        response = await db.execute(
            text(f"""
				INSERT INTO admin_info (
					id, school, college, public_bio, research_description, research_interests,
					email, phone, github_url, orcid_url, researchgate_url, google_scholar_url,
					cv_url, discord_url, linkedin_url, facebook_url, x_url, instagram_url
				)
				VALUES (
					1, :school, :college, :public_bio, :research_description, :research_interests,
					:email, :phone, :github_url, :orcid_url, :researchgate_url, :google_scholar_url,
					:cv_url, :discord_url, :linkedin_url, :facebook_url, :x_url, :instagram_url
				)
				ON CONFLICT (id) DO UPDATE 
				SET {set_query_part}
				RETURNING *;
			"""),
            query_params,
        )

        updated_row = response.mappings().first()
        await db.commit()
        return {"data": updated_row}

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating portfolio metadata: {str(e)}",
        )
