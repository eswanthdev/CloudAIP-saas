"""Razorpay payment integration service."""

import razorpay
import hashlib
import hmac
from app.config import settings
from app.utils.helpers import generate_uuid, get_current_timestamp
from app.models.dynamodb import DynamoDBTable
from typing import Dict, Any


class PaymentService:
    """Service for Razorpay payment operations."""

    def __init__(self):
        """Initialize Razorpay client and database."""
        self.razorpay_client = razorpay.Client(
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
        )
        self.payments_table = DynamoDBTable(settings.dynamodb_payments_table)

    def create_order(
        self,
        user_id: str,
        course_id: str,
        tier_name: str,
        amount_inr: float,
        currency: str = "INR",
    ) -> Dict[str, Any]:
        """Create a Razorpay order.

        Args:
            user_id: User ID.
            course_id: Course ID.
            tier_name: Tier name.
            amount_inr: Amount in INR.
            currency: Currency code.

        Returns:
            dict: Order details from Razorpay.

        Raises:
            Exception: If order creation fails.
        """
        try:
            order_id = generate_uuid()
            amount_paise = int(amount_inr * 100)  # Convert to paise

            razorpay_order = self.razorpay_client.order.create(
                amount=amount_paise,
                currency=currency,
                receipt=order_id,
                notes={
                    "user_id": user_id,
                    "course_id": course_id,
                    "tier_name": tier_name,
                },
            )

            # Store in database
            payment_record = {
                "pk": f"PAYMENT#{order_id}",
                "sk": "METADATA",
                "payment_id": razorpay_order["id"],
                "order_id": order_id,
                "user_id": user_id,
                "course_id": course_id,
                "tier_name": tier_name,
                "amount": amount_inr,
                "currency": currency,
                "status": "pending",
                "created_at": get_current_timestamp(),
                "razorpay_order_id": razorpay_order["id"],
            }

            self.payments_table.put_item(payment_record)

            return {
                "order_id": order_id,
                "razorpay_order_id": razorpay_order["id"],
                "amount": amount_inr,
                "currency": currency,
                "course_id": course_id,
                "tier_name": tier_name,
                "status": "pending",
            }

        except Exception as e:
            raise Exception(f"Failed to create payment order: {str(e)}")

    def verify_payment(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> Dict[str, Any]:
        """Verify Razorpay payment signature.

        Args:
            razorpay_order_id: Razorpay order ID.
            razorpay_payment_id: Razorpay payment ID.
            razorpay_signature: Payment signature.

        Returns:
            dict: Verification result.

        Raises:
            Exception: If verification fails.
        """
        try:
            # Verify signature
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.new(
                settings.razorpay_key_secret.encode(),
                message.encode(),
                hashlib.sha256,
            ).hexdigest()

            if expected_signature != razorpay_signature:
                raise Exception("Invalid payment signature")

            # Fetch payment details from Razorpay
            payment = self.razorpay_client.payment.fetch(razorpay_payment_id)

            return {
                "payment_id": payment["id"],
                "order_id": payment["order_id"],
                "amount": payment["amount"] / 100,  # Convert from paise
                "currency": payment["currency"],
                "status": payment["status"],
                "verified": True,
            }

        except Exception as e:
            raise Exception(f"Payment verification failed: {str(e)}")

    def capture_payment(
        self,
        razorpay_payment_id: str,
        amount_paise: int,
    ) -> Dict[str, Any]:
        """Capture a payment.

        Args:
            razorpay_payment_id: Razorpay payment ID.
            amount_paise: Amount in paise.

        Returns:
            dict: Captured payment details.

        Raises:
            Exception: If capture fails.
        """
        try:
            payment = self.razorpay_client.payment.capture(
                razorpay_payment_id,
                amount_paise,
            )

            return {
                "payment_id": payment["id"],
                "amount": payment["amount"] / 100,
                "status": payment["status"],
            }

        except Exception as e:
            raise Exception(f"Payment capture failed: {str(e)}")

    def refund_payment(
        self,
        razorpay_payment_id: str,
        amount_inr: float = None,
    ) -> Dict[str, Any]:
        """Refund a payment.

        Args:
            razorpay_payment_id: Razorpay payment ID.
            amount_inr: Amount to refund in INR (None for full refund).

        Returns:
            dict: Refund details.

        Raises:
            Exception: If refund fails.
        """
        try:
            kwargs = {}
            if amount_inr:
                kwargs["amount"] = int(amount_inr * 100)  # Convert to paise

            refund = self.razorpay_client.payment.refund(
                razorpay_payment_id,
                **kwargs,
            )

            return {
                "refund_id": refund["id"],
                "payment_id": refund["payment_id"],
                "amount": refund["amount"] / 100,
                "status": refund["status"],
            }

        except Exception as e:
            raise Exception(f"Payment refund failed: {str(e)}")

    def get_payment_details(
        self,
        razorpay_payment_id: str,
    ) -> Dict[str, Any]:
        """Get payment details from Razorpay.

        Args:
            razorpay_payment_id: Razorpay payment ID.

        Returns:
            dict: Payment details.

        Raises:
            Exception: If fetch fails.
        """
        try:
            payment = self.razorpay_client.payment.fetch(razorpay_payment_id)

            return {
                "payment_id": payment["id"],
                "order_id": payment["order_id"],
                "amount": payment["amount"] / 100,
                "currency": payment["currency"],
                "status": payment["status"],
                "method": payment.get("method"),
                "description": payment.get("description"),
                "created_at": payment.get("created_at"),
            }

        except Exception as e:
            raise Exception(f"Failed to get payment details: {str(e)}")

    def update_payment_status(
        self,
        order_id: str,
        payment_status: str,
        razorpay_payment_id: str = None,
    ) -> bool:
        """Update payment status in database.

        Args:
            order_id: Internal order ID.
            payment_status: Payment status.
            razorpay_payment_id: Razorpay payment ID.

        Returns:
            bool: True if successful.

        Raises:
            Exception: If update fails.
        """
        try:
            update_expression = "SET #status = :status, updated_at = :updated_at"
            expression_values = {
                ":status": payment_status,
                ":updated_at": get_current_timestamp(),
            }

            if razorpay_payment_id:
                update_expression += ", razorpay_payment_id = :payment_id"
                expression_values[":payment_id"] = razorpay_payment_id

            self.payments_table.update_item(
                key={"pk": f"PAYMENT#{order_id}", "sk": "METADATA"},
                update_expression=update_expression,
                expression_attribute_values=expression_values,
                expression_attribute_names={"#status": "status"},
            )

            return True

        except Exception as e:
            raise Exception(f"Failed to update payment status: {str(e)}")
