"""Pydantic models for courses."""
from pydantic import BaseModel, Field
from typing import List, Optional


class TierSchema(BaseModel):
    """Course tier."""

    tier_name: str = Field(..., description="Tier name (IGNITE, TRANSFORMATE)")
    price_usd: float = Field(..., description="Price in USD")
    price_inr: float = Field(..., description="Price in INR")
    features: dict = Field(default_factory=dict, description="Tier features")


class CreateTierRequest(BaseModel):
    """Create tier request."""

    tier_name: str = Field(..., description="Tier name")
    price_usd: float = Field(..., description="Price in USD")
    price_inr: float = Field(..., description="Price in INR")


class LessonSchema(BaseModel):
    """Course lesson."""

    lesson_id: str
    lesson_name: str
    description: str
    lesson_type: str = Field(..., description="Type: video, lab, mock_interview, placement_session")
    content_url: Optional[str]
    duration_minutes: int
    order: int
    created_at: str


class CreateLessonRequest(BaseModel):
    """Create lesson request."""

    lesson_name: str = Field(..., description="Lesson name")
    description: str = Field(..., description="Lesson description")
    lesson_type: str = Field(..., description="Lesson type")
    duration_minutes: int = Field(..., description="Duration in minutes")
    order: int = Field(..., description="Lesson order")


class ModuleSchema(BaseModel):
    """Course module."""

    module_id: str
    module_name: str
    description: str
    order: int
    lessons: List[LessonSchema] = Field(default_factory=list)
    created_at: str


class CreateModuleRequest(BaseModel):
    """Create module request."""

    module_name: str = Field(..., description="Module name")
    description: str = Field(..., description="Module description")
    order: int = Field(..., description="Module order")


class CourseSchema(BaseModel):
    """Course."""

    course_id: str
    name: str
    description: str
    category: str
    difficulty: str = Field(..., description="Difficulty level")
    instructor_id: str
    tiers: List[TierSchema] = Field(default_factory=list)
    modules: List[ModuleSchema] = Field(default_factory=list)
    created_at: str
    updated_at: str
    status: str


class CreateCourseRequest(BaseModel):
    """Create course request."""

    name: str = Field(..., description="Course name")
    description: str = Field(..., description="Course description")
    category: str = Field(..., description="Course category")
    difficulty: str = Field(..., description="Difficulty level")
    instructor_id: str = Field(..., description="Instructor ID")


class UpdateCourseRequest(BaseModel):
    """Update course request."""

    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    status: Optional[str] = None


class CourseListResponse(BaseModel):
    """Course list response."""

    course_id: str
    name: str
    description: str
    category: str
    difficulty: str
    instructor_id: str
    status: str
    created_at: str
