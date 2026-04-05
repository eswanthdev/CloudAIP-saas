"""Career support routes."""

from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.schemas.career import (
    MockInterviewScheduleRequest,
    MockInterviewSession,
    ResumeUploadRequest,
    ResumeMetadata,
    PlacementStatus,
    MentorshipSessionRequest,
    MentorshipSession,
    AssignMentorRequest,
)
from app.models.dynamodb import (
    EnrollmentsTable,
    DynamoDBTable,
)
from app.services.s3_service import S3Service
from app.api.middleware.auth import get_current_user
from app.config import settings
from app.utils.helpers import generate_uuid, get_current_timestamp, get_tier_features
from typing import List
from boto3.dynamodb.conditions import Key

router = APIRouter(prefix="/career", tags=["career"])
enrollments_table = EnrollmentsTable()
mentorship_table = DynamoDBTable(settings.dynamodb_mentorship_table)
s3_service = S3Service()


def check_transformate_tier(current_user: dict, course_id: str):
    """Check if user has TRANSFORMATE tier for course.

    Args:
        current_user: Current user.
        course_id: Course ID.

    Raises:
        HTTPException: If user lacks required tier.
    """
    enrollment = enrollments_table.get_enrollment(current_user["user_id"], course_id)
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enrolled in this course",
        )

    if enrollment["tier_name"] != "TRANSFORMATE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires TRANSFORMATE tier",
        )


@router.post("/mock-interview/schedule", response_model=MockInterviewSession)
async def schedule_mock_interview(
    request: MockInterviewScheduleRequest,
    current_user: dict = Depends(get_current_user),
):
    """Schedule a mock interview (TRANSFORMATE only).

    Args:
        request: Schedule request.
        current_user: Current authenticated user.

    Returns:
        dict: Interview session details.

    Raises:
        HTTPException: If scheduling fails.
    """
    try:
        check_transformate_tier(current_user, request.course_id)

        session_id = generate_uuid()
        session = {
            "pk": f"USER#{current_user['user_id']}",
            "sk": f"MOCK_INTERVIEW#{session_id}",
            "session_id": session_id,
            "user_id": current_user["user_id"],
            "course_id": request.course_id,
            "scheduled_at": f"{request.preferred_date}T{request.preferred_time}",
            "status": "scheduled",
            "interview_type": request.interview_type,
            "topic": request.topic,
            "created_at": get_current_timestamp(),
        }

        mentorship_table.put_item(session)

        return MockInterviewSession(
            session_id=session_id,
            user_id=current_user["user_id"],
            course_id=request.course_id,
            scheduled_at=session["scheduled_at"],
            status="scheduled",
            interview_type=request.interview_type,
            topic=request.topic,
            created_at=session["created_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/resume/upload", response_model=ResumeMetadata)
async def upload_resume(
    course_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload resume to S3 (TRANSFORMATE only).

    Args:
        course_id: Course ID.
        file: Resume file.
        current_user: Current authenticated user.

    Returns:
        dict: Resume metadata.

    Raises:
        HTTPException: If upload fails.
    """
    try:
        check_transformate_tier(current_user, course_id)

        if file.content_type not in ["application/pdf", "application/msword"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF and DOC files are allowed",
            )

        resume_id = generate_uuid()
        user_id = current_user["user_id"]

        # Save file to S3
        s3_key = f"resumes/{user_id}/{course_id}/{resume_id}/{file.filename}"
        content = await file.read()

        s3_service.s3_client.put_object(
            Bucket=settings.s3_bucket_resumes,
            Key=s3_key,
            Body=content,
            ContentType=file.content_type,
        )

        # Store metadata in DynamoDB
        resume_metadata = {
            "pk": f"USER#{user_id}",
            "sk": f"RESUME#{resume_id}",
            "resume_id": resume_id,
            "user_id": user_id,
            "course_id": course_id,
            "file_name": file.filename,
            "file_size": len(content),
            "s3_key": s3_key,
            "uploaded_at": get_current_timestamp(),
            "reviewed": False,
        }

        mentorship_table.put_item(resume_metadata)

        return ResumeMetadata(
            resume_id=resume_id,
            user_id=user_id,
            course_id=course_id,
            file_name=file.filename,
            file_size=len(content),
            uploaded_at=resume_metadata["uploaded_at"],
            reviewed=False,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/placement/status", response_model=PlacementStatus)
async def get_placement_status(
    course_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get placement tracking status (TRANSFORMATE only).

    Args:
        course_id: Course ID.
        current_user: Current authenticated user.

    Returns:
        dict: Placement status.

    Raises:
        HTTPException: If retrieval fails.
    """
    try:
        check_transformate_tier(current_user, course_id)

        user_id = current_user["user_id"]

        # Get placement record or create default
        response = mentorship_table.table.query(
            KeyConditionExpression=Key("pk").eq(f"USER#{user_id}")
            & Key("sk").eq(f"PLACEMENT#{course_id}")
        )

        items = response.get("Items", [])

        if items:
            placement = items[0]
        else:
            placement = {
                "pk": f"USER#{user_id}",
                "sk": f"PLACEMENT#{course_id}",
                "status": "not_started",
                "applications_count": 0,
                "interviews_scheduled": 0,
                "offers_received": 0,
            }

        return PlacementStatus(
            user_id=user_id,
            course_id=course_id,
            status=placement.get("status", "not_started"),
            applications_count=placement.get("applications_count", 0),
            interviews_scheduled=placement.get("interviews_scheduled", 0),
            offers_received=placement.get("offers_received", 0),
            last_updated=placement.get("last_updated", get_current_timestamp()),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/mentorship/book", response_model=MentorshipSession)
async def book_mentorship_session(
    request: MentorshipSessionRequest,
    current_user: dict = Depends(get_current_user),
):
    """Book a mentorship session (TRANSFORMATE only).

    Args:
        request: Session request.
        current_user: Current authenticated user.

    Returns:
        dict: Mentorship session details.

    Raises:
        HTTPException: If booking fails.
    """
    try:
        check_transformate_tier(current_user, request.course_id)

        session_id = generate_uuid()
        session = {
            "pk": f"USER#{current_user['user_id']}",
            "sk": f"MENTORSHIP#{session_id}",
            "session_id": session_id,
            "user_id": current_user["user_id"],
            "course_id": request.course_id,
            "topic": request.topic,
            "scheduled_at": f"{request.preferred_date}T{request.preferred_time}",
            "duration_minutes": request.duration_minutes,
            "status": "booked",
            "created_at": get_current_timestamp(),
        }

        mentorship_table.put_item(session)

        return MentorshipSession(
            session_id=session_id,
            user_id=current_user["user_id"],
            mentor_id=None,
            course_id=request.course_id,
            topic=request.topic,
            scheduled_at=session["scheduled_at"],
            duration_minutes=request.duration_minutes,
            status="booked",
            created_at=session["created_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/mentorship/sessions", response_model=List[MentorshipSession])
async def get_mentorship_sessions(current_user: dict = Depends(get_current_user)):
    """List user's mentorship sessions.

    Args:
        current_user: Current authenticated user.

    Returns:
        list: Mentorship sessions.

    Raises:
        HTTPException: If retrieval fails.
    """
    try:
        user_id = current_user["user_id"]

        response = mentorship_table.table.query(
            KeyConditionExpression=Key("pk").eq(f"USER#{user_id}")
            & Key("sk").begins_with("MENTORSHIP#")
        )

        sessions = response.get("Items", [])

        return [
            MentorshipSession(
                session_id=s["session_id"],
                user_id=s["user_id"],
                mentor_id=s.get("mentor_id"),
                course_id=s["course_id"],
                topic=s["topic"],
                scheduled_at=s["scheduled_at"],
                duration_minutes=s.get("duration_minutes", 60),
                status=s.get("status", "booked"),
                meeting_link=s.get("meeting_link"),
                feedback=s.get("feedback"),
                created_at=s["created_at"],
            )
            for s in sessions
        ]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
