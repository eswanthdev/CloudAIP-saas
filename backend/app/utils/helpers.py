"""Utility helper functions for the application."""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict
from decimal import Decimal
import json


def generate_uuid() -> str:
    """Generate a UUID string.

    Returns:
        str: A UUID string.
    """
    return str(uuid.uuid4())


def get_current_timestamp() -> str:
    """Get current timestamp in ISO 8601 format.

    Returns:
        str: Current timestamp.
    """
    return datetime.now(timezone.utc).isoformat()


def get_timestamp_after_hours(hours: int) -> str:
    """Get timestamp after specified hours.

    Args:
        hours: Number of hours to add.

    Returns:
        str: Timestamp after specified hours.
    """
    future_time = datetime.now(timezone.utc) + timedelta(hours=hours)
    return future_time.isoformat()


def parse_timestamp(timestamp_str: str) -> datetime:
    """Parse ISO 8601 timestamp string to datetime.

    Args:
        timestamp_str: ISO 8601 timestamp string.

    Returns:
        datetime: Parsed datetime object.
    """
    return datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))


def format_response(
    success: bool,
    data: Any = None,
    message: str = None,
    status_code: int = 200,
) -> Dict[str, Any]:
    """Format API response.

    Args:
        success: Whether the operation was successful.
        data: Response data.
        message: Response message.
        status_code: HTTP status code.

    Returns:
        dict: Formatted response.
    """
    response = {
        "success": success,
        "status_code": status_code,
    }

    if message:
        response["message"] = message

    if data is not None:
        response["data"] = data

    return response


def format_error_response(
    message: str,
    error_code: str = None,
    status_code: int = 400,
    details: Any = None,
) -> Dict[str, Any]:
    """Format error response.

    Args:
        message: Error message.
        error_code: Error code.
        status_code: HTTP status code.
        details: Additional error details.

    Returns:
        dict: Formatted error response.
    """
    response = {
        "success": False,
        "status_code": status_code,
        "message": message,
    }

    if error_code:
        response["error_code"] = error_code

    if details:
        response["details"] = details

    return response


def decimal_to_float(obj: Any) -> Any:
    """Convert Decimal objects to float for JSON serialization.

    Args:
        obj: Object to convert.

    Returns:
        Converted object.
    """
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [decimal_to_float(item) for item in obj]
    return obj


def dynamodb_to_python(item: Dict[str, Any]) -> Dict[str, Any]:
    """Convert DynamoDB item to Python dict with proper types.

    Args:
        item: DynamoDB item.

    Returns:
        dict: Python dictionary.
    """
    if isinstance(item, dict):
        return {k: dynamodb_to_python(v) for k, v in item.items()}
    if isinstance(item, list):
        return [dynamodb_to_python(i) for i in item]
    return item


def validate_email(email: str) -> bool:
    """Validate email format.

    Args:
        email: Email address to validate.

    Returns:
        bool: True if valid, False otherwise.
    """
    import re

    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def validate_phone(phone: str) -> bool:
    """Validate phone number format (international).

    Args:
        phone: Phone number to validate.

    Returns:
        bool: True if valid, False otherwise.
    """
    import re

    pattern = r"^\+?[1-9]\d{1,14}$"
    return re.match(pattern, phone) is not None


def calculate_tier_price_usd(tier_name: str) -> float:
    """Get tier pricing in USD.

    Args:
        tier_name: Tier name (IGNITE, TRANSFORMATE, etc).

    Returns:
        float: Price in USD.
    """
    pricing = {
        "IGNITE": 99.99,
        "TRANSFORMATE": 299.99,
    }
    return pricing.get(tier_name, 0.0)


def calculate_tier_price_inr(tier_name: str) -> float:
    """Get tier pricing in INR.

    Args:
        tier_name: Tier name.

    Returns:
        float: Price in INR.
    """
    pricing = {
        "IGNITE": 8299.0,
        "TRANSFORMATE": 24999.0,
    }
    return pricing.get(tier_name, 0.0)


def get_tier_features(tier_name: str) -> Dict[str, Any]:
    """Get features for a given tier.

    Args:
        tier_name: Tier name.

    Returns:
        dict: Tier features.
    """
    features = {
        "IGNITE": {
            "lesson_types": ["video", "lab"],
            "mock_interviews": 0,
            "mentorship_hours": 0,
            "placement_support": False,
            "resume_review": False,
        },
        "TRANSFORMATE": {
            "lesson_types": ["video", "lab", "mock_interview", "placement_session"],
            "mock_interviews": 4,
            "mentorship_hours": 10,
            "placement_support": True,
            "resume_review": True,
        },
    }
    return features.get(tier_name, {})


def format_currency(amount: float, currency: str = "INR") -> str:
    """Format amount as currency string.

    Args:
        amount: Amount to format.
        currency: Currency code (INR, USD).

    Returns:
        str: Formatted currency string.
    """
    symbols = {"INR": "₹", "USD": "$"}
    symbol = symbols.get(currency, currency)
    return f"{symbol}{amount:,.2f}"


def parse_jwt_payload(payload: str) -> Dict[str, Any]:
    """Parse JWT payload without verification (for debugging).

    Args:
        payload: JWT payload string.

    Returns:
        dict: Parsed payload.
    """
    import base64

    padding = 4 - len(payload) % 4
    if padding != 4:
        payload += "=" * padding
    decoded = base64.urlsafe_b64decode(payload)
    return json.loads(decoded)
