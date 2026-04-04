"""Pydantic models for enrollments."""
from pydantic import BaseModel, Field
from typing import Optional


class EnrollmentRequest(BaseModel):
    """Enrollment request."""

    course_id: str = Field(..., description="Course ID")
    tier_name: str = Field(..., description="Tier name (IGNITE, TRANSFORMATE)")


class EnrollmentResponse(BaseModel):
    """Enrollment response."""

    enrollment_id: str
    user_id: str
    course_id: str
    tier_name: str
    status: str
    enrolled_at: str
    updated_at: str


class UserCourseEnrollment(BaseModel):
    """User course enrollment with course details."""

    enrollment_id: str
    course_id: str
    course_name: str
    tier_name: str
    status: str
    enrolled_at: str
    progress_percentage: int
