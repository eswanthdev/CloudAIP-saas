"""AWS Cognito integration service."""

import boto3
from botocore.exceptions import ClientError
from app.config import settings
from app.utils.helpers import generate_uuid, get_current_timestamp
from typing import Dict, Any, Optional


class CognitoService:
    """Service for Cognito operations."""

    def __init__(self):
        """Initialize Cognito client."""
        self.client = boto3.client(
            "cognito-idp",
            region_name=settings.cognito_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )
        self.user_pool_id = settings.cognito_user_pool_id
        self.client_id = settings.cognito_client_id

    def sign_up(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        phone: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sign up a new user.

        Args:
            email: User email.
            password: User password.
            first_name: First name.
            last_name: Last name.
            phone: Optional phone number.

        Returns:
            dict: Signup response.

        Raises:
            Exception: If signup fails.
        """
        try:
            user_attributes = [
                {"Name": "email", "Value": email},
                {"Name": "given_name", "Value": first_name},
                {"Name": "family_name", "Value": last_name},
                {"Name": "email_verified", "Value": "true"},
            ]

            if phone:
                user_attributes.append({"Name": "phone_number", "Value": phone})

            response = self.client.admin_create_user(
                UserPoolId=self.user_pool_id,
                Username=email,
                UserAttributes=user_attributes,
                TemporaryPassword=password,
                MessageAction="SUPPRESS",
            )

            # Set permanent password
            self.client.admin_set_user_password(
                UserPoolId=self.user_pool_id,
                Username=email,
                Password=password,
                Permanent=True,
            )

            # Add user to student group
            try:
                self.client.admin_add_user_to_group(
                    UserPoolId=self.user_pool_id,
                    Username=email,
                    GroupName="student",
                )
            except ClientError:
                pass  # Group might not exist

            user_id = response["User"]["Username"]

            return {
                "user_id": user_id,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "created_at": get_current_timestamp(),
            }

        except ClientError as e:
            if e.response["Error"]["Code"] == "UsernameExistsException":
                raise Exception("User already exists")
            raise Exception(f"Signup failed: {str(e)}")

    def authenticate(
        self,
        email: str,
        password: str,
    ) -> Dict[str, Any]:
        """Authenticate user and return tokens.

        Args:
            email: User email.
            password: User password.

        Returns:
            dict: Authentication response with tokens.

        Raises:
            Exception: If authentication fails.
        """
        try:
            response = self.client.admin_initiate_auth(
                UserPoolId=self.user_pool_id,
                ClientId=self.client_id,
                AuthFlow="ADMIN_NO_SRP_AUTH",
                AuthParameters={
                    "USERNAME": email,
                    "PASSWORD": password,
                },
            )

            auth_result = response.get("AuthenticationResult", {})

            return {
                "user_id": email,
                "access_token": auth_result.get("AccessToken"),
                "id_token": auth_result.get("IdToken"),
                "refresh_token": auth_result.get("RefreshToken"),
                "expires_in": auth_result.get("ExpiresIn", 3600),
                "token_type": "bearer",
            }

        except ClientError as e:
            if e.response["Error"]["Code"] == "NotAuthorizedException":
                raise Exception("Invalid email or password")
            if e.response["Error"]["Code"] == "UserNotConfirmedException":
                raise Exception("User not confirmed")
            raise Exception(f"Authentication failed: {str(e)}")

    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token using refresh token.

        Args:
            refresh_token: Refresh token.

        Returns:
            dict: New tokens.

        Raises:
            Exception: If refresh fails.
        """
        try:
            response = self.client.admin_initiate_auth(
                UserPoolId=self.user_pool_id,
                ClientId=self.client_id,
                AuthFlow="REFRESH_TOKEN_AUTH",
                AuthParameters={
                    "REFRESH_TOKEN": refresh_token,
                },
            )

            auth_result = response.get("AuthenticationResult", {})

            return {
                "access_token": auth_result.get("AccessToken"),
                "id_token": auth_result.get("IdToken"),
                "expires_in": auth_result.get("ExpiresIn", 3600),
                "token_type": "bearer",
            }

        except ClientError as e:
            raise Exception(f"Token refresh failed: {str(e)}")

    def get_user(self, user_id: str) -> Dict[str, Any]:
        """Get user attributes from Cognito.

        Args:
            user_id: User ID (username).

        Returns:
            dict: User attributes.

        Raises:
            Exception: If user lookup fails.
        """
        try:
            response = self.client.admin_get_user(
                UserPoolId=self.user_pool_id,
                Username=user_id,
            )

            attributes = {}
            for attr in response.get("UserAttributes", []):
                attributes[attr["Name"]] = attr["Value"]

            return {
                "user_id": response["Username"],
                "email": attributes.get("email"),
                "first_name": attributes.get("given_name"),
                "last_name": attributes.get("family_name"),
                "phone": attributes.get("phone_number"),
                "created_at": response.get("UserCreateDate", "").isoformat(),
                "updated_at": response.get("UserLastModifiedDate", "").isoformat(),
                "status": response.get("UserStatus"),
            }

        except ClientError as e:
            if e.response["Error"]["Code"] == "UserNotFoundException":
                raise Exception("User not found")
            raise Exception(f"User lookup failed: {str(e)}")

    def change_password(
        self,
        user_id: str,
        current_password: str,
        new_password: str,
    ) -> bool:
        """Change user password.

        Args:
            user_id: User ID.
            current_password: Current password.
            new_password: New password.

        Returns:
            bool: True if successful.

        Raises:
            Exception: If password change fails.
        """
        try:
            self.client.admin_set_user_password(
                UserPoolId=self.user_pool_id,
                Username=user_id,
                Password=new_password,
                Permanent=True,
            )
            return True

        except ClientError as e:
            raise Exception(f"Password change failed: {str(e)}")

    def update_user_attributes(
        self,
        user_id: str,
        attributes: Dict[str, str],
    ) -> bool:
        """Update user attributes.

        Args:
            user_id: User ID.
            attributes: Dict of attributes to update.

        Returns:
            bool: True if successful.

        Raises:
            Exception: If update fails.
        """
        try:
            user_attributes = [
                {"Name": key, "Value": value} for key, value in attributes.items()
            ]

            self.client.admin_update_user_attributes(
                UserPoolId=self.user_pool_id,
                Username=user_id,
                UserAttributes=user_attributes,
            )
            return True

        except ClientError as e:
            raise Exception(f"User update failed: {str(e)}")
