"""Authentication middleware and dependencies."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import jwt
from typing import Optional, Dict, Any
import requests
from app.config import settings
from app.utils.helpers import parse_jwt_payload

security = HTTPBearer()


def get_cognito_public_keys() -> Dict[str, Any]:
    """Get Cognito public keys for JWT verification.

    Returns:
        dict: Public keys from Cognito JWKS endpoint.

    Raises:
        HTTPException: If unable to fetch keys.
    """
    jwks_url = (
        f"https://cognito-idp.{settings.cognito_region}.amazonaws.com/"
        f"{settings.cognito_user_pool_id}/.well-known/jwks.json"
    )

    try:
        response = requests.get(jwks_url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to fetch Cognito keys: {str(e)}",
        )


def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token from Cognito.

    Args:
        token: JWT token to verify.

    Returns:
        dict: Decoded token payload.

    Raises:
        HTTPException: If token is invalid.
    """
    try:
        # Get the key ID from token header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token header",
            )

        # Get public keys from Cognito
        public_keys = get_cognito_public_keys()
        public_key = None

        for key in public_keys.get("keys", []):
            if key.get("kid") == kid:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break

        if not public_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find matching key",
            )

        # Verify and decode token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.cognito_client_id,
        )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )


async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
) -> Dict[str, Any]:
    """Get current user from JWT token.

    Args:
        credentials: HTTP Bearer credentials.

    Returns:
        dict: User payload from token.

    Raises:
        HTTPException: If token is invalid or missing.
    """
    token = credentials.credentials
    payload = verify_token(token)

    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims",
        )

    return {
        "user_id": user_id,
        "email": email,
        "token": token,
        "payload": payload,
    }


async def require_role(
    allowed_roles: list = ["student"],
) -> callable:
    """Create a dependency that requires specific roles.

    Args:
        allowed_roles: List of allowed roles.

    Returns:
        callable: Dependency function.
    """

    async def check_role(current_user: Dict[str, Any] = Depends(get_current_user)):
        # In a real application, fetch user role from database
        # For now, check if 'cognito:groups' exists in token
        groups = current_user.get("payload", {}).get("cognito:groups", [])

        if not any(role in allowed_roles for role in groups):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return check_role


async def require_tier(
    course_id: str,
    required_tier: str = "IGNITE",
) -> callable:
    """Create a dependency that checks enrollment tier for a course.

    Args:
        course_id: Course ID to check.
        required_tier: Required tier level.

    Returns:
        callable: Dependency function.
    """

    async def check_tier(current_user: Dict[str, Any] = Depends(get_current_user)):
        # Import here to avoid circular imports
        from app.models.dynamodb import EnrollmentsTable

        user_id = current_user.get("user_id")
        enrollments_table = EnrollmentsTable()

        enrollment = enrollments_table.get_enrollment(user_id, course_id)

        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enrolled in this course",
            )

        user_tier = enrollment.get("tier_name")

        # TRANSFORMATE tier has more features than IGNITE
        tier_hierarchy = {"IGNITE": 1, "TRANSFORMATE": 2}

        user_tier_level = tier_hierarchy.get(user_tier, 0)
        required_tier_level = tier_hierarchy.get(required_tier, 0)

        if user_tier_level < required_tier_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {required_tier} tier",
            )

        current_user["enrollment"] = enrollment
        return current_user

    return check_tier


async def optional_user(
    credentials: Optional[HTTPAuthCredentials] = Depends(security),
) -> Optional[Dict[str, Any]]:
    """Get current user if authenticated, otherwise None.

    Args:
        credentials: Optional HTTP Bearer credentials.

    Returns:
        dict: User payload if authenticated, None otherwise.
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
