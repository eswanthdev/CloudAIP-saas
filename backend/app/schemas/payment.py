"""Pydantic models for payments."""

from pydantic import BaseModel, Field
from typing import Optional


class CreateOrderRequest(BaseModel):
    """Create payment order request."""

    course_id: str = Field(..., description="Course ID")
    tier_name: str = Field(..., description="Tier name (IGNITE, TRANSFORMATE)")
    currency: str = Field("INR", description="Currency (INR, USD)")


class CreateOrderResponse(BaseModel):
    """Create payment order response."""

    order_id: str
    course_id: str
    tier_name: str
    amount: float
    currency: str
    status: str


class VerifyPaymentRequest(BaseModel):
    """Verify payment request."""

    order_id: str = Field(..., description="Order ID from payment gateway")
    payment_id: str = Field(..., description="Payment ID from payment gateway")
    signature: str = Field(..., description="Razorpay signature")


class VerifyPaymentResponse(BaseModel):
    """Verify payment response."""

    payment_id: str
    order_id: str
    amount: float
    currency: str
    status: str
    verified_at: str


class PaymentHistory(BaseModel):
    """Payment history entry."""

    payment_id: str
    order_id: str
    course_id: str
    course_name: str
    tier_name: str
    amount: float
    currency: str
    status: str
    paid_at: str


class PaymentListResponse(BaseModel):
    """Payment list response."""

    payments: list[PaymentHistory]
    total_count: int
    total_amount_inr: float
    total_amount_usd: float
