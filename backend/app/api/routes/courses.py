"""Courses routes."""
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.course import (
    CourseSchema,
    CreateCourseRequest,
    UpdateCourseRequest,
    CourseListResponse,
)
from app.schemas.enrollment import (
    EnrollmentRequest,
    EnrollmentResponse,
    UserCourseEnrollment,
)
from app.models.dynamodb import CoursesTable, EnrollmentsTable, ProgressTable
from app.api.middleware.auth import get_current_user
from app.services.payment_service import PaymentService
from app.utils.helpers import get_tier_features, calculate_tier_price_inr
from typing import List

router = APIRouter(prefix="/courses", tags=["courses"])
courses_table = CoursesTable()
enrollments_table = EnrollmentsTable()
progress_table = ProgressTable()
payment_service = PaymentService()


@router.get("", response_model=List[CourseListResponse])
async def list_courses():
    """List all courses (public endpoint).

    Returns:
        list: List of courses.

    Raises:
        HTTPException: If listing fails.
    """
    try:
        courses = courses_table.list_courses()

        return [
            CourseListResponse(
                course_id=course["course_id"],
                name=course["name"],
                description=course["description"],
                category=course["category"],
                difficulty=course["difficulty"],
                instructor_id=course["instructor_id"],
                status=course["status"],
                created_at=course["created_at"],
            )
            for course in courses
            if course.get("status") == "active"
        ]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("/{course_id}", response_model=CourseSchema)
async def get_course(course_id: str):
    """Get course details with tiers and modules.

    Args:
        course_id: Course ID.

    Returns:
        dict: Course details.

    Raises:
        HTTPException: If course not found.
    """
    try:
        course = courses_table.get_course(course_id)

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

        # Get tiers
        tiers = courses_table.get_tiers(course_id)
        tier_list = [
            {
                "tier_name": tier["tier_name"],
                "price_usd": tier.get("price_usd", 0),
                "price_inr": tier.get("price_inr", 0),
                "features": get_tier_features(tier["tier_name"]),
            }
            for tier in tiers
        ]

        # Get modules
        modules = courses_table.get_modules(course_id)

        return CourseSchema(
            course_id=course["course_id"],
            name=course["name"],
            description=course["description"],
            category=course["category"],
            difficulty=course["difficulty"],
            instructor_id=course["instructor_id"],
            tiers=tier_list,
            modules=[
                {
                    "module_id": m["module_id"],
                    "module_name": m["module_name"],
                    "description": m["description"],
                    "order": m["order"],
                    "lessons": [],
                    "created_at": m["created_at"],
                }
                for m in modules
            ],
            created_at=course["created_at"],
            updated_at=course["updated_at"],
            status=course["status"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/enroll", response_model=EnrollmentResponse)
async def enroll_course(
    request: EnrollmentRequest,
    current_user: dict = Depends(get_current_user),
):
    """Enroll user in course with tier.

    Args:
        request: Enrollment request.
        current_user: Current authenticated user.

    Returns:
        dict: Enrollment details.

    Raises:
        HTTPException: If enrollment fails.
    """
    try:
        user_id = current_user["user_id"]

        # Check if already enrolled
        existing = enrollments_table.get_enrollment(user_id, request.course_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already enrolled in this course",
            )

        # Verify course exists
        course = courses_table.get_course(request.course_id)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

        # Get tier price
        price = calculate_tier_price_inr(request.tier_name)
        if price == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tier",
            )

        # Create enrollment
        enrollment = enrollments_table.create_enrollment(
            user_id=user_id,
            course_id=request.course_id,
            tier_name=request.tier_name,
        )

        return EnrollmentResponse(
            enrollment_id=enrollment["enrollment_id"],
            user_id=user_id,
            course_id=request.course_id,
            tier_name=request.tier_name,
            status=enrollment["status"],
            enrolled_at=enrollment["enrolled_at"],
            updated_at=enrollment["updated_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/my-courses", response_model=List[UserCourseEnrollment])
async def get_my_courses(current_user: dict = Depends(get_current_user)):
    """Get user's enrolled courses.

    Args:
        current_user: Current authenticated user.

    Returns:
        list: User's enrolled courses with progress.

    Raises:
        HTTPException: If retrieval fails.
    """
    try:
        user_id = current_user["user_id"]

        enrollments = enrollments_table.get_user_enrollments(user_id)

        result = []
        for enrollment in enrollments:
            course = courses_table.get_course(enrollment["course_id"])
            if course:
                # Get progress
                progress = progress_table.get_course_progress(
                    user_id, enrollment["course_id"]
                )
                total_lessons = len(progress) if progress else 0
                completed = sum(1 for p in progress if p.get("status") == "completed")
                percentage = (completed / total_lessons * 100) if total_lessons > 0 else 0

                result.append(
                    UserCourseEnrollment(
                        enrollment_id=enrollment["enrollment_id"],
                        course_id=enrollment["course_id"],
                        course_name=course["name"],
                        tier_name=enrollment["tier_name"],
                        status=enrollment["status"],
                        enrolled_at=enrollment["enrolled_at"],
                        progress_percentage=int(percentage),
                    )
                )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
