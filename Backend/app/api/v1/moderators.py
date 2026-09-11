from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.utility import limiter
from app.utility.auth import validate_user_access, validate_admin_access, validate_moderator_access
from app.utility.time import bd_now


router = APIRouter(prefix="/moderators", tags=["moderators"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


@router.get("")
async def list_moderators(
    db: AsyncSession = Depends(get_db)
):
    try:
        # Query only safe, public columns for users with the ADMIN role
        query = text("""
			SELECT
				uuid, name, email, mobile_number, status
			FROM
				users
			WHERE
				role = 'MODERATOR'
			ORDER BY
				created_at DESC
		""")
        response = await db.execute(query)
        moderators = response.mappings().all()
        return {"data": moderators}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving moderators: {str(e)}",
        )


@router.get("/interested-to-be-moderator")
async def list_interested_moderators(
    db: AsyncSession = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
):
    auth = validate_admin_access(token)
    if not auth["is_valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")
    try:
        # Query users who have requested to be moderators
        query = text("""
            SELECT
				u.uuid, u.name, u.email, u.mobile_number, r.created_at AS request_created_at
			FROM 
            	tobe_moderator_requests r
			JOIN 
            	users u ON r.user_id = u.id
			ORDER BY 
            	r.created_at DESC
		""")
        response = await db.execute(query)
        rows = response.mappings().all()

        # 2. Convert to standard dictionaries and apply your bd_now() function
        interested_users = []
        for row in rows:
            user_dict = dict(row)
            # Apply your custom function to the datetime object
            user_dict["request_created_at"] = bd_now(user_dict["request_created_at"])
            interested_users.append(user_dict)

        return {"data": interested_users}

    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving interested moderators",
        )


@router.get("/if-self-interested-to-be-moderator")
async def check_if_interested_to_be_moderator(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
):
    # 1. Validate the token to get the user's UUID
    access = validate_user_access(token)
    if not access["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token"),
        )

    uuid = access["data"]["uuid"]
    try:
        # 2. Define the query using EXISTS for optimal performance
        query = text("""
			SELECT EXISTS (
                SELECT 
                	1
                FROM 
                	tobe_moderator_requests
				WHERE 
                	user_id = :uuid
			)
		""")
        response = await db.execute(query, {"uuid": uuid})
        is_interested = response.scalar()
        return {"data": {"is_interested": is_interested}}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking moderator request status: {str(e)}",
        )


@router.post("/request-to-be-moderator", status_code=status.HTTP_201_CREATED)
async def request_to_be_moderator(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    # 1. Validate the token
    access = validate_user_access(token)
    if not access["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token"),
        )

    uuid = access["data"]["uuid"]

    try:
        # 2. Define the query
        query = text("""
			INSERT INTO
				tobe_moderator_requests(user_id)
			VALUES
				(:uuid)
			RETURNING
				id
		""")

        # 3. Execute the query and bind the uuid parameter
        response = await db.execute(query, {"uuid": uuid})

        # 4. Commit the transaction to save it to the database
        await db.commit()

        # 5. Fetch the returned ID
        request_id = response.scalar_one()

        return {
            "message": "Moderator request submitted successfully",
            "data": {"request_id": request_id},
        }

    except Exception as e:
        # Rollback the transaction if something goes wrong
        await db.rollback()
        # (Optional) You can check for unique constraint violations here if a user
        # is only allowed to have one pending request at a time.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting moderator request: {str(e)}",
        )


from fastapi import Response  # Make sure to import this if you haven't


@router.delete("/request-to-be-moderator", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request_to_be_moderator(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
):
    # 1. Validate the token to get the user's UUID
    access = validate_user_access(token)
    if not access["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=access.get("message", "Invalid or expired token"),
        )

    uuid = access["data"]["uuid"]

    try:
        # 2. Define the DELETE query
        query = text("""
			DELETE FROM
				tobe_moderator_requests
			WHERE
				user_id = :uuid
		""")

        # 3. Execute the query
        result = await db.execute(query, {"uuid": uuid})

        # 4. Check if a row was actually deleted (optional but recommended)
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No pending moderator request found for this user.",
            )

        # 5. Commit the transaction
        await db.commit()

        # 6. Return nothing for 204 No Content
        return None

    except HTTPException:
        # Allow the 404/401 exceptions to pass through
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting moderator request: {str(e)}",
        )


@router.get("/{uuid:uuid}")
async def get_moderator(uuid: UUID, db: AsyncSession = Depends(get_db)):
    try:
        # Query public metadata for an MODERATOR user matching the UUID
        query = text("""
			SELECT
				uuid, name, username, bio, email, mobile_number, status, address, created_at
			FROM
				users
			WHERE
				uuid = :uuid
				AND role = 'MODERATOR'
		""")
        response = await db.execute(query, {"uuid": str(uuid)})
        moderator = response.mappings().first()
        if not moderator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Moderator not found"
            )
        return {"data": moderator}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving moderator: {str(e)}",
        )


@router.post("/{uuid:uuid}")
async def create_moderator(uuid: UUID, db: AsyncSession = Depends(get_db)):
    """
    Promotes an existing user (e.g., a STUDENT) to moderator status (MODERATOR).
    """
    try:
        # Update the user's role to 'MODERATOR' and set status to 'ACTIVE'
        query = text("""
			UPDATE 
				users
			SET 
				role = CAST('MODERATOR' AS account_role),
				status = CAST('ACTIVE' AS account_status),
				updated_at = NOW()
			WHERE 
				uuid = :uuid
			RETURNING 
				uuid, name, username, email, role, status
		""")
        response = await db.execute(query, {"uuid": str(uuid)})
        updated_user = response.mappings().first()

        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        await db.commit()
        return {
            "message": "User successfully promoted to moderator",
            "data": updated_user,
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error promoting user to moderator: {str(e)}",
        )


@router.delete("/{uuid:uuid}")
async def delete_moderator(uuid: UUID, db: AsyncSession = Depends(get_db)):
    """
    Demote their role back to 'STUDENT' (Safe & Recommended to avoid data orphans).
    The implementation below performs a Demotion (Role reset).
    """
    try:
        query = text("""
			UPDATE
				users
			SET
				role = CAST('STUDENT' AS account_role),
				updated_at = NOW()
			WHERE
				uuid = :uuid
				AND role = 'MODERATOR'
			RETURNING
				uuid, name, username, role
		""")
        response = await db.execute(query, {"uuid": str(uuid)})
        demoted_user = response.mappings().first()

        if not demoted_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Moderator not found"
            )

        await db.commit()
        return {
            "message": "Moderator successfully demoted back to student",
            "data": demoted_user,
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing moderator status: {str(e)}",
        )
