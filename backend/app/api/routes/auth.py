"""Authentication routes."""

from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import (
    SignupRequest,
    SignupResponse,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    UserProfile,
)
from app.services.cognito_service import CognitoService
from app.api.middleware.auth import get_current_user
from app.models.dynamodb import DynamoDBTable
from app.config import settings
from app.utils.helpers import get_current_timestamp

router = APIRouter(prefix="/auth", tags=["authentication"])
cognito_service = CognitoService()
users_table = DynamoDBTable(settings.dynamodb_users_table)


@router.post("/signup", response_model=SignupResponse)
async def signup(request: SignupRequest):
    """Register a new user.

    Args:
        request: Signup request.

    Returns:
        dict: Signup response.

    Raises:
        HTTPException: If signup fails.
    """
    try:
        # Create user in Cognito
        user_data = cognito_service.sign_up(
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name,
            phone=request.phone,
        )

        # Store user metadata in DynamoDB
        user_record = {
            "pk": f"USER#{user_data['user_id']}",
            "sk": "METADATA",
            "user_id": user_data["user_id"],
            "email": request.email,
            "first_name": request.first_name,
            "last_name": request.last_name,
            "phone": request.phone or "",
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
            "role": "student",
        }
        users_table.put_item(user_record)

        return SignupResponse(
            user_id=user_data["user_id"],
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            message="Signup successful. You can now login.",
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authenticate user and return tokens.

    Args:
        request: Login request.

    Returns:
        dict: Login response with tokens.

    Raises:
        HTTPException: If login fails.
    """
    try:
        auth_result = cognito_service.authenticate(
            email=request.email,
            password=request.password,
        )

        user = cognito_service.get_user(request.email)

        return LoginResponse(
            user_id=user["user_id"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            access_token=auth_result["access_token"],
            expires_in=auth_result["expires_in"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token.

    Args:
        request: Refresh token request.

    Returns:
        dict: New tokens.

    Raises:
        HTTPException: If refresh fails.
    """
    try:
        result = cognito_service.refresh_token(request.refresh_token)
        return RefreshTokenResponse(
            access_token=result["access_token"],
            expires_in=result["expires_in"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile.

    Args:
        current_user: Current user from JWT.

    Returns:
        dict: User profile.

    Raises:
        HTTPException: If user lookup fails.
    """
    try:
        user = cognito_service.get_user(current_user["user_id"])

        # Get additional data from DynamoDB if available
        try:
            user_record = users_table.get_item(
                {
                    "pk": f"USER#{current_user['user_id']}",
                    "sk": "METADATA",
                }
            )
            if user_record:
                user["phone"] = user_record.get("phone")
        except Exception:
            pass

        return UserProfile(
            user_id=user["user_id"],
            email=user["email"],
            first_name=user.get("first_name", ""),
            last_name=user.get("last_name", ""),
            phone=user.get("phone"),
            created_at=user.get("created_at", ""),
            updated_at=user.get("updated_at", ""),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
