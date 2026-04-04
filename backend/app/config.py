"""Configuration module for FinOps SaaS backend."""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # AWS Configuration
    aws_region: str = os.getenv("AWS_REGION", "ap-south-1")
    aws_access_key_id: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    aws_secret_access_key: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")

    # DynamoDB Configuration
    dynamodb_courses_table: str = os.getenv("DYNAMODB_COURSES_TABLE", "courses")
    dynamodb_enrollments_table: str = os.getenv("DYNAMODB_ENROLLMENTS_TABLE", "enrollments")
    dynamodb_users_table: str = os.getenv("DYNAMODB_USERS_TABLE", "users")
    dynamodb_progress_table: str = os.getenv("DYNAMODB_PROGRESS_TABLE", "progress")
    dynamodb_payments_table: str = os.getenv("DYNAMODB_PAYMENTS_TABLE", "payments")
    dynamodb_mentorship_table: str = os.getenv("DYNAMODB_MENTORSHIP_TABLE", "mentorship_sessions")
    dynamodb_leads_table: str = os.getenv("DYNAMODB_LEADS_TABLE", "service_leads")

    # Cognito Configuration
    cognito_user_pool_id: str = os.getenv("COGNITO_USER_POOL_ID", "")
    cognito_client_id: str = os.getenv("COGNITO_CLIENT_ID", "")
    cognito_region: str = os.getenv("COGNITO_REGION", "ap-south-1")

    # S3 Configuration
    s3_bucket_videos: str = os.getenv("S3_BUCKET_VIDEOS", "finops-videos")
    s3_bucket_resumes: str = os.getenv("S3_BUCKET_RESUMES", "finops-resumes")
    s3_bucket_certificates: str = os.getenv("S3_BUCKET_CERTIFICATES", "finops-certificates")
    s3_region: str = os.getenv("S3_REGION", "ap-south-1")

    # Razorpay Configuration
    razorpay_key_id: str = os.getenv("RAZORPAY_KEY_ID", "")
    razorpay_key_secret: str = os.getenv("RAZORPAY_KEY_SECRET", "")

    # CORS Configuration
    allowed_origins: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://finops-training.com",
    ]

    # JWT Configuration
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    # Email/SES Configuration
    ses_sender_email: str = os.getenv("SES_SENDER_EMAIL", "noreply@finops-training.com")

    # Application Configuration
    app_name: str = "FinOps SaaS Training Backend"
    app_version: str = "1.0.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = environment == "development"

    class Config:
        """Pydantic config."""
        case_sensitive = False
        env_file = ".env"


settings = Settings()
