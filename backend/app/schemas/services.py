"""Pydantic models for services."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class ServiceLeadRequest(BaseModel):
    """Service lead submission request."""

    company_name: str = Field(..., description="Company name")
    contact_email: EmailStr = Field(..., description="Contact email")
    contact_phone: str = Field(..., description="Contact phone")
    contact_name: str = Field(..., description="Contact person name")
    service_type: str = Field(
        ...,
        description="Service type: finops_strategy, cost_optimization, cloud_audit, training",
    )
    company_size: str = Field(
        ..., description="Company size: startup, small, medium, enterprise"
    )
    annual_cloud_spend: Optional[str] = Field(None, description="Annual cloud spend")
    description: Optional[str] = Field(None, description="Additional details")


class ServiceLeadResponse(BaseModel):
    """Service lead response."""

    lead_id: str
    company_name: str
    contact_email: str
    contact_phone: str
    contact_name: str
    service_type: str
    company_size: str
    annual_cloud_spend: Optional[str]
    status: str
    created_at: str
    updated_at: str


class UpdateLeadStatusRequest(BaseModel):
    """Update lead status request."""

    status: str = Field(
        ..., description="Status: new, contacted, qualified, proposal_sent, won, lost"
    )
    notes: Optional[str] = Field(None, description="Status update notes")
    assigned_to: Optional[str] = Field(None, description="Sales person ID")


class ServiceLeadListResponse(BaseModel):
    """Service lead list response."""

    lead_id: str
    company_name: str
    contact_name: str
    contact_email: str
    service_type: str
    company_size: str
    status: str
    created_at: str
    assigned_to: Optional[str]
