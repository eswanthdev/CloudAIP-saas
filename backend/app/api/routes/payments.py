"""Payment routes."""

from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    PaymentListResponse,
    PaymentHistory,
)
from app.models.dynamodb import EnrollmentsTable, DynamoDBTable
from app.services.payment_service import PaymentService
from app.services.notification_service import NotificationService
from app.services.cognito_service import CognitoService
from app.api.middleware.auth import get_current_user
from app.config import settings
from app.utils.helpers import calculate_tier_price_inr, get_current_timestamp
from typing import List

router = APIRouter(prefix="/payments", tags=["payments"])
payment_service = PaymentService()
notification_service = NotificationService()
cognito_service = CognitoService()
enrollments_table = EnrollmentsTable()
payments_table = DynamoDBTable(settings.dynamodb_payments_table)


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_payment_order(
    request: CreateOrderRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a Razorpay order for course enrollment.

    Args:
        request: Order creation request.
        current_user: Current authenticated user.

    Returns:
        dict: Order details.

    Raises:
        HTTPException: If order creation fails.
    """
    try:
        user_id = current_user["user_id"]

        # Get tier price
        amount_inr = calculate_tier_price_inr(request.tier_name)
        if amount_inr == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tier",
            )

        # Create order in Razorpay
        order = payment_service.create_order(
            user_id=user_id,
            course_id=request.course_id,
            tier_name=request.tier_name,
            amount_inr=amount_inr,
            currency=request.currency,
        )

        return CreateOrderResponse(
            order_id=order["order_id"],
            course_id=order["course_id"],
            tier_name=order["tier_name"],
            amount=order["amount"],
            currency=order["currency"],
            status=order["status"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user),
):
    """Verify Razorpay payment and create enrollment.

    Args:
        request: Payment verification request.
        current_user: Current authenticated user.

    Returns:
        dict: Verification result.

    Raises:
        HTTPException: If verification fails.
    """
    try:
        user_id = current_user["user_id"]

        # Verify payment signature
        verified_payment = payment_service.verify_payment(
            razorpay_order_id=request.order_id,
            razorpay_payment_id=request.payment_id,
            razorpay_signature=request.signature,
        )

        # Get original order details
        order_records = payments_table.scan()
        order_details = None

        for record in order_records:
            if record.get("razorpay_order_id") == request.order_id:
                order_details = record
                break

        if not order_details:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order not found",
            )

        course_id = order_details.get("course_id")
        tier_name = order_details.get("tier_name")

        # Create enrollment
        enrollment = enrollments_table.create_enrollment(
            user_id=user_id,
            course_id=course_id,
            tier_name=tier_name,
        )

        # Update payment status
        payment_service.update_payment_status(
            order_id=order_details["order_id"],
            payment_status="verified",
            razorpay_payment_id=request.payment_id,
        )

        # Send confirmation emails
        try:
            user = cognito_service.get_user(user_id)

            notification_service.send_payment_confirmation(
                email=user["email"],
                first_name=user.get("first_name", ""),
                course_name="Course",  # Should fetch from database
                amount=order_details.get("amount", 0),
                currency=order_details.get("currency", "INR"),
            )

            notification_service.send_enrollment_confirmation(
                email=user["email"],
                first_name=user.get("first_name", ""),
                course_name="Course",
                tier_name=tier_name,
            )
        except Exception:
            pass  # Don't fail if email sending fails

        return VerifyPaymentResponse(
            payment_id=request.payment_id,
            order_id=request.order_id,
            amount=order_details.get("amount", 0),
            currency=order_details.get("currency", "INR"),
            status="verified",
            verified_at=get_current_timestamp(),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/history", response_model=PaymentListResponse)
async def get_payment_history(current_user: dict = Depends(get_current_user)):
    """Get payment history for user.

    Args:
        current_user: Current authenticated user.

    Returns:
        dict: Payment history.

    Raises:
        HTTPException: If retrieval fails.
    """
    try:
        user_id = current_user["user_id"]

        # Get all payments for user
        payments = payments_table.scan()

        user_payments = [
            p
            for p in payments
            if p.get("user_id") == user_id and p.get("sk") == "METADATA"
        ]

        payment_list = [
            PaymentHistory(
                payment_id=p.get("razorpay_payment_id", p.get("payment_id", "")),
                order_id=p["order_id"],
                course_id=p["course_id"],
                course_name="Course",  # Should fetch from database
                tier_name=p["tier_name"],
                amount=p["amount"],
                currency=p["currency"],
                status=p["status"],
                paid_at=p.get("created_at", ""),
            )
            for p in user_payments
            if p.get("status") in ["verified", "completed"]
        ]

        total_inr = sum(p.amount for p in payment_list if p.currency == "INR")
        total_usd = sum(p.amount for p in payment_list if p.currency == "USD")

        return PaymentListResponse(
            payments=payment_list,
            total_count=len(payment_list),
            total_amount_inr=total_inr,
            total_amount_usd=total_usd,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
