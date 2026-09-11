from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, DataError

from app.db import get_db
from app.utility import limiter
from app.core.config import settings
from app.schema.v1.students import StudentUpdate

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/pending")
async def list_pending_students(
    db: AsyncSession = Depends(get_db)
):
    try:
        query = text("""
            SELECT 
                u.uuid, u.name, u.email, u.image_url, u.status, s.student_batch, u.created_at
            FROM 
                users u JOIN students s 
                    ON u.id = s.id
            WHERE 
                u.status = 'PENDING' 
                AND u.role = 'STUDENT'
        """)
        result = await db.execute(query)

        students = []
        for row in result.fetchall():
            student_dict = dict(row._mapping)
            student_dict["image_url"] = (
                student_dict.get("image_url") or settings.default_profile_image_url
            )
            students.append(student_dict)

        return {"data": students}

    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while fetching pending students.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.get("/pending/{uuid}")
async def get_pending_student(
    uuid: str, 
    db: AsyncSession = Depends(get_db)
):
    try:
        query = text("""
            SELECT u.uuid, u.name, u.email, u.image_url, u.status, s.student_batch, u.created_at
            FROM users u
            JOIN students s ON u.id = s.id
            WHERE u.status = 'PENDING' AND u.role = 'STUDENT' AND u.uuid = CAST(:uuid AS UUID)
        """)
        result = await db.execute(query, {"uuid": uuid})
        student = result.fetchone()

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pending student not found.",
            )

        student_dict = dict(student._mapping)
        student_dict["image_url"] = (
            student_dict.get("image_url") or settings.default_profile_image_url
        )

        return student_dict

    except DataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format provided.",
        )
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while fetching the pending student.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.delete("/pending/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pending_student(
    uuid: str, db: 
    AsyncSession = Depends(get_db)
):
    try:
        query = text("""
            DELETE FROM users 
            WHERE uuid = CAST(:uuid AS UUID) AND status = 'PENDING' AND role = 'STUDENT'
            RETURNING id
        """)
        result = await db.execute(query, {"uuid": uuid})
        deleted = result.fetchone()

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pending student not found or already processed.",
            )

        await db.commit()
        return None

    except DataError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format provided.",
        )
    except HTTPException:
        await db.rollback()
        raise
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while deleting the pending student.",
        )
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.patch("/pending/{uuid}/verify", status_code=status.HTTP_202_ACCEPTED)
async def verify_pending_student(
    uuid: str, 
    db: AsyncSession = Depends(get_db)
):
    try:
        query = text("""
            UPDATE users 
            SET status = 'ACTIVE' 
            WHERE uuid = CAST(:uuid AS UUID) AND status = 'PENDING' AND role = 'STUDENT'
            RETURNING id, uuid, status
        """)
        result = await db.execute(query, {"uuid": uuid})
        verified = result.fetchone()

        if not verified:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found or already verified.",
            )

        await db.commit()
        return {"message": "Student verified successfully", "uuid": str(verified.uuid)}

    except DataError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format provided.",
        )
    except HTTPException:
        await db.rollback()
        raise
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while verifying the student.",
        )
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.get("")
async def list_students(
    db: AsyncSession = Depends(get_db)
):
    try:
        query = text("""
            SELECT u.uuid, u.name, u.username, u.email, u.image_url, u.status, s.student_batch
            FROM users u
            JOIN students s ON u.id = s.id
            WHERE u.role = 'STUDENT'
        """)
        result = await db.execute(query)

        students = []
        for row in result.fetchall():
            student_dict = dict(row._mapping)
            student_dict["image_url"] = (
                student_dict.get("image_url") or settings.default_profile_image_url
            )
            students.append(student_dict)

        return {"data": students}

    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while fetching students.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.get("/{uuid}")
async def get_student(
    uuid: str, 
    db: AsyncSession = Depends(get_db)
):
    try:
        query = text("""
            SELECT u.uuid, u.name, u.username, u.email, u.image_url, u.bio, u.mobile_number, 
                   u.address, u.status, s.student_batch, u.created_at, u.updated_at
            FROM users u
            JOIN students s ON u.id = s.id
            WHERE u.uuid = CAST(:uuid AS UUID) AND u.role = 'STUDENT'
        """)
        result = await db.execute(query, {"uuid": uuid})
        student = result.fetchone()

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Student not found."
            )

        student_dict = dict(student._mapping)
        student_dict["image_url"] = (
            student_dict.get("image_url") or settings.default_profile_image_url
        )

        return student_dict

    except DataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format provided.",
        )
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while fetching the student.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.patch("/{uuid}", status_code=status.HTTP_202_ACCEPTED)
async def update_student(
    uuid: str, 
    payload: StudentUpdate, 
    db: AsyncSession = Depends(get_db)
):
    # Extract only the fields that were explicitly set in the request
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )

    try:
        # 1. Verify existence and get user ID
        check_query = text(
            "SELECT id FROM users WHERE uuid = CAST(:uuid AS UUID) AND role = 'STUDENT'"
        )
        result = await db.execute(check_query, {"uuid": uuid})
        user_row = result.fetchone()

        if not user_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Student not found."
            )

        user_id = user_row.id

        # 2. Filter allowed fields mapping to respective tables
        valid_user_fields = {
            "name",
            "username",
            "bio",
            "mobile_number",
            "address",
            "image_url",
        }
        valid_student_fields = {"student_batch"}

        user_updates = {k: v for k, v in update_data.items() if k in valid_user_fields}
        student_updates = {
            k: v for k, v in update_data.items() if k in valid_student_fields
        }

        # 3. Dynamic Updates
        if user_updates:
            set_clause = ", ".join([f"{k} = :{k}" for k in user_updates.keys()])
            update_user_query = text(f"UPDATE users SET {set_clause} WHERE id = :id")
            await db.execute(update_user_query, {"id": user_id, **user_updates})

        if student_updates:
            set_clause = ", ".join([f"{k} = :{k}" for k in student_updates.keys()])
            update_student_query = text(
                f"UPDATE students SET {set_clause} WHERE id = :id"
            )
            await db.execute(update_student_query, {"id": user_id, **student_updates})

        await db.commit()
        return {"message": "Student updated successfully."}

    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database conflict. The username, email, or other unique value might already exist.",
        )
    except DataError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid data format provided (e.g., malformed UUID).",
        )
    except HTTPException:
        await db.rollback()
        raise
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while updating the student.",
        )
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.delete("/{uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    uuid: str, 
    db: AsyncSession = Depends(get_db)
):
    try:
        # CASCADE rule on the students table ensures cleanup of the relation
        query = text("""
            DELETE FROM users 
            WHERE uuid = CAST(:uuid AS UUID) AND role = 'STUDENT'
            RETURNING id
        """)
        result = await db.execute(query, {"uuid": uuid})
        deleted = result.fetchone()

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Student not found."
            )

        await db.commit()
        return None

    except DataError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format provided.",
        )
    except HTTPException:
        await db.rollback()
        raise
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while deleting the student.",
        )
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )
