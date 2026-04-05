"""Lessons routes."""

from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.course import LessonSchema
from app.models.dynamodb import CoursesTable, EnrollmentsTable, DynamoDBTable
from app.services.s3_service import S3Service
from app.api.middleware.auth import get_current_user
from app.config import settings
from app.utils.helpers import get_tier_features
from typing import List, Optional
from boto3.dynamodb.conditions import Key

router = APIRouter(prefix="/lessons", tags=["lessons"])
courses_table = CoursesTable()
enrollments_table = EnrollmentsTable()
lessons_table = DynamoDBTable(settings.dynamodb_courses_table)
s3_service = S3Service()


@router.get("/{module_id}", response_model=List[LessonSchema])
async def get_module_lessons(
    module_id: str,
    course_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get lessons for a module (validate enrollment and tier).

    Args:
        module_id: Module ID.
        course_id: Course ID.
        current_user: Current authenticated user.

    Returns:
        list: Module lessons.

    Raises:
        HTTPException: If access denied or module not found.
    """
    try:
        user_id = current_user["user_id"]

        # Verify enrollment
        enrollment = enrollments_table.get_enrollment(user_id, course_id)
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enrolled in this course",
            )

        # Get lessons from table
        response = lessons_table.table.query(
            KeyConditionExpression=Key("pk").eq(f"MODULE#{module_id}")
            & Key("sk").begins_with("LESSON#")
        )

        lessons = response.get("Items", [])

        # Filter by tier access
        user_tier = enrollment["tier_name"]
        tier_features = get_tier_features(user_tier)
        allowed_types = tier_features.get("lesson_types", [])

        accessible_lessons = [
            LessonSchema(
                lesson_id=lesson["lesson_id"],
                lesson_name=lesson["lesson_name"],
                description=lesson["description"],
                lesson_type=lesson["lesson_type"],
                content_url=lesson.get("content_url"),
                duration_minutes=lesson.get("duration_minutes", 0),
                order=lesson.get("order", 0),
                created_at=lesson["created_at"],
            )
            for lesson in lessons
            if lesson.get("lesson_type") in allowed_types
        ]

        return sorted(accessible_lessons, key=lambda x: x.order)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("/{lesson_id}/content")
async def get_lesson_content(
    lesson_id: str,
    course_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get lesson content or presigned URL (validate tier access).

    Args:
        lesson_id: Lesson ID.
        course_id: Course ID.
        current_user: Current authenticated user.

    Returns:
        dict: Content URL or presigned URL.

    Raises:
        HTTPException: If access denied or lesson not found.
    """
    try:
        user_id = current_user["user_id"]

        # Verify enrollment and tier
        enrollment = enrollments_table.get_enrollment(user_id, course_id)
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enrolled in this course",
            )

        # Get lesson
        response = lessons_table.table.query(
            KeyConditionExpression=Key("pk").eq(f"LESSON#{lesson_id}")
            & Key("sk").eq("METADATA")
        )

        lessons = response.get("Items", [])
        if not lessons:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found",
            )

        lesson = lessons[0]

        # Check tier access
        user_tier = enrollment["tier_name"]
        tier_features = get_tier_features(user_tier)
        allowed_types = tier_features.get("lesson_types", [])

        lesson_type = lesson.get("lesson_type")
        if lesson_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {user_tier} tier to access {lesson_type} lessons",
            )

        # Generate presigned URL for video content
        content_url = lesson.get("content_url")

        if lesson_type == "video" and content_url:
            try:
                # Extract S3 key from URL
                bucket = settings.s3_bucket_videos
                key = (
                    content_url.split(f"{bucket}/")[-1]
                    if bucket in content_url
                    else content_url
                )

                presigned_url = s3_service.generate_presigned_url(
                    bucket=bucket,
                    key=key,
                    expiration=3600,
                    operation="get_object",
                )

                return {
                    "lesson_id": lesson_id,
                    "lesson_name": lesson["lesson_name"],
                    "lesson_type": lesson_type,
                    "content_url": presigned_url,
                    "duration_minutes": lesson.get("duration_minutes", 0),
                }

            except Exception:
                pass

        # Return direct content URL if available
        return {
            "lesson_id": lesson_id,
            "lesson_name": lesson["lesson_name"],
            "lesson_type": lesson_type,
            "content_url": content_url,
            "duration_minutes": lesson.get("duration_minutes", 0),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
