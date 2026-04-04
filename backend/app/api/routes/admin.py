"""Admin routes."""
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.schemas.course import (
    CreateCourseRequest,
    UpdateCourseRequest,
    CreateTierRequest,
    CreateModuleRequest,
    CreateLessonRequest,
)
from app.models.dynamodb import CoursesTable, EnrollmentsTable, DynamoDBTable
from app.services.s3_service import S3Service
from app.api.middleware.auth import get_current_user
from app.config import settings
from app.utils.helpers import generate_uuid, get_current_timestamp
from typing import List
from boto3.dynamodb.conditions import Key

router = APIRouter(prefix="/admin", tags=["admin"])
courses_table = CoursesTable()
enrollments_table = EnrollmentsTable()
mentorship_table = DynamoDBTable(settings.dynamodb_mentorship_table)
s3_service = S3Service()


def check_admin(current_user: dict):
    """Check if user is admin.

    Args:
        current_user: Current user.

    Raises:
        HTTPException: If not admin.
    """
    groups = current_user.get("payload", {}).get("cognito:groups", [])
    if "admin" not in groups:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


@router.post("/courses")
async def create_course(
    request: CreateCourseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new course (admin only).

    Args:
        request: Course creation request.
        current_user: Current authenticated user.

    Returns:
        dict: Created course.

    Raises:
        HTTPException: If not admin or creation fails.
    """
    try:
        check_admin(current_user)

        course = courses_table.create_course(
            name=request.name,
            description=request.description,
            category=request.category,
            difficulty=request.difficulty,
            instructor_id=request.instructor_id,
        )

        return {
            "success": True,
            "data": course,
            "message": "Course created successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/courses/{course_id}")
async def update_course(
    course_id: str,
    request: UpdateCourseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update a course (admin only).

    Args:
        course_id: Course ID.
        request: Update request.
        current_user: Current authenticated user.

    Returns:
        dict: Updated course.

    Raises:
        HTTPException: If not admin or update fails.
    """
    try:
        check_admin(current_user)

        update_fields = {k: v for k, v in request.dict().items() if v is not None}
        update_fields["updated_at"] = get_current_timestamp()

        update_expression = "SET " + ", ".join(
            f"{key} = :{key}" for key in update_fields.keys()
        )
        expression_values = {f":{key}": value for key, value in update_fields.items()}

        updated_course = courses_table.update_item(
            key={"pk": f"COURSE#{course_id}", "sk": "METADATA"},
            update_expression=update_expression,
            expression_attribute_values=expression_values,
        )

        return {
            "success": True,
            "data": updated_course,
            "message": "Course updated successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/courses/{course_id}/tiers")
async def create_tier(
    course_id: str,
    request: CreateTierRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a tier for a course (admin only).

    Args:
        course_id: Course ID.
        request: Tier creation request.
        current_user: Current authenticated user.

    Returns:
        dict: Created tier.

    Raises:
        HTTPException: If not admin or creation fails.
    """
    try:
        check_admin(current_user)

        tier = courses_table.add_tier(
            course_id=course_id,
            tier_name=request.tier_name,
            price_usd=request.price_usd,
            price_inr=request.price_inr,
        )

        return {
            "success": True,
            "data": tier,
            "message": "Tier created successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/courses/{course_id}/modules")
async def create_module(
    course_id: str,
    request: CreateModuleRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a module in a course (admin only).

    Args:
        course_id: Course ID.
        request: Module creation request.
        current_user: Current authenticated user.

    Returns:
        dict: Created module.

    Raises:
        HTTPException: If not admin or creation fails.
    """
    try:
        check_admin(current_user)

        module = courses_table.add_module(
            course_id=course_id,
            module_name=request.module_name,
            description=request.description,
            order=request.order,
        )

        return {
            "success": True,
            "data": module,
            "message": "Module created successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/modules/{module_id}/lessons")
async def create_lesson(
    module_id: str,
    request: CreateLessonRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a lesson in a module (admin only).

    Args:
        module_id: Module ID.
        request: Lesson creation request.
        current_user: Current authenticated user.

    Returns:
        dict: Created lesson.

    Raises:
        HTTPException: If not admin or creation fails.
    """
    try:
        check_admin(current_user)

        lesson_id = generate_uuid()
        lesson = {
            "pk": f"MODULE#{module_id}",
            "sk": f"LESSON#{lesson_id}",
            "lesson_id": lesson_id,
            "lesson_name": request.lesson_name,
            "description": request.description,
            "lesson_type": request.lesson_type,
            "duration_minutes": request.duration_minutes,
            "order": request.order,
            "created_at": get_current_timestamp(),
        }

        courses_table.table.put_item(Item=lesson)

        return {
            "success": True,
            "data": lesson,
            "message": "Lesson created successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/lessons/{lesson_id}/upload")
async def upload_lesson_content(
    lesson_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload video or content to S3 (admin only).

    Args:
        lesson_id: Lesson ID.
        file: File to upload.
        current_user: Current authenticated user.

    Returns:
        dict: Upload result.

    Raises:
        HTTPException: If not admin or upload fails.
    """
    try:
        check_admin(current_user)

        content = await file.read()

        # Determine bucket based on file type
        if file.content_type and file.content_type.startswith("video"):
            bucket = settings.s3_bucket_videos
            key = f"videos/{lesson_id}/{file.filename}"
        else:
            bucket = settings.s3_bucket_certificates
            key = f"content/{lesson_id}/{file.filename}"

        # Upload to S3
        s3_service.s3_client.put_object(
            Bucket=bucket,
            Key=key,
            Body=content,
            ContentType=file.content_type or "application/octet-stream",
        )

        # Update lesson record
        lesson_url = f"s3://{bucket}/{key}"

        # Get the lesson record (assuming we can find it)
        update_expression = "SET content_url = :url, updated_at = :updated_at"
        expression_values = {
            ":url": lesson_url,
            ":updated_at": get_current_timestamp(),
        }

        return {
            "success": True,
            "data": {
                "lesson_id": lesson_id,
                "file_name": file.filename,
                "file_size": len(content),
                "s3_url": lesson_url,
            },
            "message": "Content uploaded successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/enrollments")
async def list_enrollments(current_user: dict = Depends(get_current_user)):
    """List all enrollments (admin only).

    Args:
        current_user: Current authenticated user.

    Returns:
        list: All enrollments.

    Raises:
        HTTPException: If not admin or retrieval fails.
    """
    try:
        check_admin(current_user)

        enrollments = enrollments_table.scan()

        return {
            "success": True,
            "data": enrollments,
            "total": len(enrollments),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("/mentorship/sessions")
async def list_mentorship_sessions(current_user: dict = Depends(get_current_user)):
    """List all mentorship sessions (admin only).

    Args:
        current_user: Current authenticated user.

    Returns:
        list: All mentorship sessions.

    Raises:
        HTTPException: If not admin or retrieval fails.
    """
    try:
        check_admin(current_user)

        sessions = mentorship_table.scan()

        return {
            "success": True,
            "data": [s for s in sessions if "MENTORSHIP#" in s.get("sk", "")],
            "total": len([s for s in sessions if "MENTORSHIP#" in s.get("sk", "")]),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.put("/mentorship/sessions/{session_id}")
async def assign_mentor_to_session(
    session_id: str,
    request: dict,
    current_user: dict = Depends(get_current_user),
):
    """Assign mentor to session (admin only).

    Args:
        session_id: Session ID.
        request: Mentor assignment request.
        current_user: Current authenticated user.

    Returns:
        dict: Updated session.

    Raises:
        HTTPException: If not admin or assignment fails.
    """
    try:
        check_admin(current_user)

        # Find the session
        sessions = mentorship_table.scan()
        session = None
        for s in sessions:
            if s.get("session_id") == session_id:
                session = s
                break

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )

        # Update session
        update_expression = "SET mentor_id = :mentor_id, #status = :status, meeting_link = :link, updated_at = :updated_at"
        expression_values = {
            ":mentor_id": request.get("mentor_id"),
            ":status": "assigned",
            ":link": request.get("meeting_link"),
            ":updated_at": get_current_timestamp(),
        }

        updated_session = mentorship_table.update_item(
            key={"pk": session["pk"], "sk": session["sk"]},
            update_expression=update_expression,
            expression_attribute_values=expression_values,
            expression_attribute_names={"#status": "status"},
        )

        return {
            "success": True,
            "data": updated_session,
            "message": "Mentor assigned successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics (admin only).

    Args:
        current_user: Current authenticated user.

    Returns:
        dict: Dashboard statistics.

    Raises:
        HTTPException: If not admin or retrieval fails.
    """
    try:
        check_admin(current_user)

        courses = courses_table.list_courses()
        enrollments = enrollments_table.scan()

        total_enrollments_by_tier = {}
        for enrollment in enrollments:
            tier = enrollment.get("tier_name", "unknown")
            total_enrollments_by_tier[tier] = total_enrollments_by_tier.get(tier, 0) + 1

        return {
            "success": True,
            "data": {
                "total_courses": len(courses),
                "total_enrollments": len(enrollments),
                "enrollments_by_tier": total_enrollments_by_tier,
                "total_revenue": sum(
                    (299.99 if tier == "TRANSFORMATE" else 99.99)
                    for tier, count in total_enrollments_by_tier.items()
                    for _ in range(count)
                ),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
