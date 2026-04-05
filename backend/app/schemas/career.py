"""Pydantic models for career support."""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


class MockInterviewScheduleRequest(BaseModel):
    """Schedule mock interview request."""

    course_id: str = Field(..., description="Course ID")
    preferred_date: str = Field(..., description="Preferred date (ISO 8601)")
    preferred_time: str = Field(..., description="Preferred time (HH:MM)")
    interview_type: str = Field(..., description="Type: technical, behavioral, both")
    topic: Optional[str] = Field(None, description="Specific topic")


class MockInterviewSession(BaseModel):
    """Mock interview session."""

    session_id: str
    user_id: str
    course_id: str
    scheduled_at: str
    status: str = Field(..., description="scheduled, completed, cancelled")
    interview_type: str
    topic: Optional[str]
    feedback: Optional[str]
    rating: Optional[int]
    created_at: str


class ResumeUploadRequest(BaseModel):
    """Resume upload request."""

    course_id: str = Field(..., description="Course ID")


class ResumeMetadata(BaseModel):
    """Resume metadata."""

    resume_id: str
    user_id: str
    course_id: str
    file_name: str
    file_size: int
    uploaded_at: str
    reviewed: bool = False
    reviewer_notes: Optional[str] = None


class PlacementStatus(BaseModel):
    """Placement status."""

    user_id: str
    course_id: str
    status: str = Field(..., description="not_started, in_progress, placed, rejected")
    applications_count: int = 0
    interviews_scheduled: int = 0
    offers_received: int = 0
    last_updated: str


class MentorshipSessionRequest(BaseModel):
    """Book mentorship session request."""

    course_id: str = Field(..., description="Course ID")
    topic: str = Field(..., description="Session topic")
    preferred_date: str = Field(..., description="Preferred date (ISO 8601)")
    preferred_time: str = Field(..., description="Preferred time (HH:MM)")
    duration_minutes: int = Field(60, description="Duration in minutes")


class MentorshipSession(BaseModel):
    """Mentorship session."""

    session_id: str
    user_id: str
    mentor_id: Optional[str] = None
    course_id: str
    topic: str
    scheduled_at: str
    duration_minutes: int
    status: str = Field(..., description="booked, assigned, completed, cancelled")
    meeting_link: Optional[str] = None
    feedback: Optional[str] = None
    created_at: str


class AssignMentorRequest(BaseModel):
    """Assign mentor to session request."""

    mentor_id: str = Field(..., description="Mentor user ID")
    meeting_link: Optional[str] = Field(None, description="Video meeting link")
