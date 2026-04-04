"""Pydantic models for progress tracking."""
from pydantic import BaseModel, Field
from typing import Optional


class MarkCompleteRequest(BaseModel):
    """Mark lesson complete request."""

    lesson_id: str = Field(..., description="Lesson ID")
    time_spent_minutes: int = Field(..., ge=0, description="Time spent in minutes")


class LessonProgressResponse(BaseModel):
    """Lesson progress response."""

    lesson_id: str
    completed: bool
    completed_at: Optional[str]
    time_spent_minutes: int


class CourseProgressResponse(BaseModel):
    """Course progress response."""

    course_id: str
    course_name: str
    total_lessons: int
    completed_lessons: int
    progress_percentage: int
    enrollment_tier: str
    total_time_spent_minutes: int
    last_accessed: Optional[str]


class ModuleProgressResponse(BaseModel):
    """Module progress response."""

    module_id: str
    module_name: str
    total_lessons: int
    completed_lessons: int
    progress_percentage: int
    lessons: list[LessonProgressResponse]


class CertificateGenerateRequest(BaseModel):
    """Generate certificate request."""

    course_id: str = Field(..., description="Course ID")


class CertificateResponse(BaseModel):
    """Certificate response."""

    certificate_id: str
    user_id: str
    course_id: str
    course_name: str
    issued_date: str
    certificate_url: str
    pdf_url: str
