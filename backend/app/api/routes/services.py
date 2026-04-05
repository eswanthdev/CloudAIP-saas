"""Service leads routes."""

from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.services import (
    ServiceLeadRequest,
    ServiceLeadResponse,
    UpdateLeadStatusRequest,
    ServiceLeadListResponse,
)
from app.models.dynamodb import DynamoDBTable
from app.api.middleware.auth import get_current_user
from app.config import settings
from app.utils.helpers import generate_uuid, get_current_timestamp
from typing import List
from boto3.dynamodb.conditions import Key

router = APIRouter(prefix="/services", tags=["services"])
leads_table = DynamoDBTable(settings.dynamodb_leads_table)


@router.post("/lead", response_model=ServiceLeadResponse)
async def submit_service_lead(request: ServiceLeadRequest):
    """Submit consulting service lead (public endpoint).

    Args:
        request: Lead submission request.

    Returns:
        dict: Lead details.

    Raises:
        HTTPException: If submission fails.
    """
    try:
        lead_id = generate_uuid()

        lead = {
            "pk": f"LEAD#{lead_id}",
            "sk": "METADATA",
            "lead_id": lead_id,
            "company_name": request.company_name,
            "contact_email": request.contact_email,
            "contact_phone": request.contact_phone,
            "contact_name": request.contact_name,
            "service_type": request.service_type,
            "company_size": request.company_size,
            "annual_cloud_spend": request.annual_cloud_spend,
            "description": request.description,
            "status": "new",
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
        }

        leads_table.put_item(lead)

        return ServiceLeadResponse(
            lead_id=lead_id,
            company_name=request.company_name,
            contact_email=request.contact_email,
            contact_phone=request.contact_phone,
            contact_name=request.contact_name,
            service_type=request.service_type,
            company_size=request.company_size,
            annual_cloud_spend=request.annual_cloud_spend,
            status="new",
            created_at=lead["created_at"],
            updated_at=lead["updated_at"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/leads", response_model=List[ServiceLeadListResponse])
async def list_leads(current_user: dict = Depends(get_current_user)):
    """List all service leads (admin only).

    Args:
        current_user: Current authenticated user.

    Returns:
        list: Service leads.

    Raises:
        HTTPException: If not admin or retrieval fails.
    """
    try:
        # Check admin role
        groups = current_user.get("payload", {}).get("cognito:groups", [])
        if "admin" not in groups:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        # Scan all leads
        leads = leads_table.scan()

        return [
            ServiceLeadListResponse(
                lead_id=lead["lead_id"],
                company_name=lead["company_name"],
                contact_name=lead["contact_name"],
                contact_email=lead["contact_email"],
                service_type=lead["service_type"],
                company_size=lead["company_size"],
                status=lead["status"],
                created_at=lead["created_at"],
                assigned_to=lead.get("assigned_to"),
            )
            for lead in leads
            if lead.get("sk") == "METADATA"
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.put("/leads/{lead_id}/status", response_model=ServiceLeadResponse)
async def update_lead_status(
    lead_id: str,
    request: UpdateLeadStatusRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update lead status (admin only).

    Args:
        lead_id: Lead ID.
        request: Status update request.
        current_user: Current authenticated user.

    Returns:
        dict: Updated lead.

    Raises:
        HTTPException: If not admin or update fails.
    """
    try:
        # Check admin role
        groups = current_user.get("payload", {}).get("cognito:groups", [])
        if "admin" not in groups:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        # Get current lead
        lead = leads_table.get_item({"pk": f"LEAD#{lead_id}", "sk": "METADATA"})

        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found",
            )

        # Update status
        update_expression = "SET #status = :status, updated_at = :updated_at"
        expression_values = {
            ":status": request.status,
            ":updated_at": get_current_timestamp(),
        }
        expression_names = {"#status": "status"}

        if request.notes:
            update_expression += ", notes = :notes"
            expression_values[":notes"] = request.notes

        if request.assigned_to:
            update_expression += ", assigned_to = :assigned_to"
            expression_values[":assigned_to"] = request.assigned_to

        updated_lead = leads_table.update_item(
            key={"pk": f"LEAD#{lead_id}", "sk": "METADATA"},
            update_expression=update_expression,
            expression_attribute_values=expression_values,
            expression_attribute_names=expression_names,
        )

        return ServiceLeadResponse(
            lead_id=updated_lead["lead_id"],
            company_name=updated_lead["company_name"],
            contact_email=updated_lead["contact_email"],
            contact_phone=updated_lead["contact_phone"],
            contact_name=updated_lead["contact_name"],
            service_type=updated_lead["service_type"],
            company_size=updated_lead["company_size"],
            annual_cloud_spend=updated_lead.get("annual_cloud_spend"),
            status=updated_lead["status"],
            created_at=updated_lead["created_at"],
            updated_at=updated_lead["updated_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
