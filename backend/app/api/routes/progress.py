"""Progress tracking routes."""

from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.progress import (
    MarkCompleteRequest,
    CourseProgressResponse,
    CertificateResponse,
)
from app.models.dynamodb import (
    ProgressTable,
    EnrollmentsTable,
    CoursesTable,
    DynamoDBTable,
)
from app.services.certificate_service import CertificateService
from app.services.s3_service import S3Service
from app.services.notification_service import NotificationService
from app.services.cognito_service import CognitoService
from app.api.middleware.auth import get_current_user
from app.config import settings
from app.utils.helpers import generate_uuid, get_current_timestamp
from typing import Optional

router = APIRouter(prefix="/progress", tags=["progress"])
progress_table = ProgressTable()
enrollments_table = EnrollmentsTable()
courses_table = CoursesTable()
certificate_service = CertificateService()
s3_service = S3Service()
notification_service = NotificationService()
cognito_service = CognitoService()
certificates_table = DynamoDBTable(settings.dynamodb_courses_table)


@router.post("/mark-complete")
async def mark_lesson_complete(
    request: MarkCompleteRequest,
    current_user: dict = Depends(get_current_user),
):
    """Mark lesson as complete.

    Args:
        request: Mark complete request.
        current_user: Current authenticated user.

    Returns:
        dict: Progress update.

    Raises:
        HTTPException: If update fails.
    """
    try:
        user_id = current_user["user_id"]

        progress = progress_table.mark_lesson_complete(
            user_id=user_id,
            lesson_id=request.lesson_id,
            time_spent_minutes=request.time_spent_minutes,
        )

        return {
            "success": True,
            "data": progress,
            "message": "Lesson marked as complete",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/course/{course_id}", response_model=CourseProgressResponse)
async def get_course_progress(
    course_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get course progress percentage.

    Args:
        course_id: Course ID.
        current_user: Current authenticated user.

    Returns:
        dict: Course progress.

    Raises:
        HTTPException: If retrieval fails.
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

        # Get course details
        course = courses_table.get_course(course_id)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

        # Get progress
        progress = progress_table.get_course_progress(user_id, course_id)

        # Count total lessons (this is simplified - in production, you'd query all lessons)
        total_lessons = len(progress) if progress else 0
        completed_lessons = sum(1 for p in progress if p.get("status") == "completed")
        total_time = sum(p.get("time_spent_minutes", 0) for p in progress)

        percentage = (
            (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        )

        return CourseProgressResponse(
            course_id=course_id,
            course_name=course["name"],
            total_lessons=total_lessons,
            completed_lessons=completed_lessons,
            progress_percentage=int(percentage),
            enrollment_tier=enrollment["tier_name"],
            total_time_spent_minutes=int(total_time),
            last_accessed=progress[-1].get("completed_at") if progress else None,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/certificate/{course_id}", response_model=CertificateResponse)
async def generate_certificate(
    course_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Generate certificate if course is 100% complete.

    Args:
        course_id: Course ID.
        current_user: Current authenticated user.

    Returns:
        dict: Certificate details.

    Raises:
        HTTPException: If generation fails.
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

        # Get course details
        course = courses_table.get_course(course_id)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

        # Get progress
        progress = progress_table.get_course_progress(user_id, course_id)
        total_lessons = len(progress) if progress else 0
        completed_lessons = sum(1 for p in progress if p.get("status") == "completed")

        if total_lessons == 0 or completed_lessons < total_lessons:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Course not complete ({completed_lessons}/{total_lessons} lessons)",
            )

        # Get user details
        user = cognito_service.get_user(user_id)

        # Generate certificate PDF
        pdf_buffer, certificate_id = certificate_service.generate_certificate_pdf(
            user_name=f"{user.get('first_name', '')} {user.get('last_name', '')}",
            course_name=course["name"],
        )

        # Upload PDF to S3
        s3_key = f"certificates/{user_id}/{course_id}/{certificate_id}.pdf"
        s3_service.s3_client.put_object(
            Bucket=settings.s3_bucket_certificates,
            Key=s3_key,
            Body=pdf_buffer.getvalue(),
            ContentType="application/pdf",
        )

        # Create certificate record
        certificate_metadata = certificate_service.create_certificate_metadata(
            user_id=user_id,
            course_id=course_id,
            course_name=course["name"],
            user_name=f"{user.get('first_name', '')} {user.get('last_name', '')}",
            completion_date=get_current_timestamp(),
            certificate_id=certificate_id,
        )

        # Store in database
        cert_record = {
            "pk": f"CERTIFICATE#{certificate_id}",
            "sk": "METADATA",
            **certificate_metadata,
        }
        certificates_table.put_item(cert_record)

        # Generate presigned URL for download
        pdf_url = s3_service.generate_presigned_url(
            bucket=settings.s3_bucket_certificates,
            key=s3_key,
            expiration=86400,  # 24 hours
        )

        # Send notification email
        try:
            notification_service.send_certificate_notification(
                email=user["email"],
                first_name=user.get("first_name", ""),
                course_name=course["name"],
                certificate_url=pdf_url,
            )
        except Exception:
            pass  # Don't fail if email sending fails

        return CertificateResponse(
            certificate_id=certificate_id,
            user_id=user_id,
            course_id=course_id,
            course_name=course["name"],
            issued_date=get_current_timestamp(),
            certificate_url=f"s3://{settings.s3_bucket_certificates}/{s3_key}",
            pdf_url=pdf_url,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
