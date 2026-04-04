variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "lambda_source_dir" {
  type        = string
  description = "Path to Lambda source code directory"
}

variable "lambda_layer_dir" {
  type        = string
  description = "Path to Lambda layer dependencies directory"
}

variable "lambda_execution_role_arn" {
  type        = string
  description = "ARN of the Lambda execution IAM role"
}

variable "dynamodb_users_table" {
  type        = string
  description = "Name of the DynamoDB users table"
}

variable "dynamodb_courses_table" {
  type        = string
  description = "Name of the DynamoDB courses table"
}

variable "dynamodb_course_tiers_table" {
  type        = string
  description = "Name of the DynamoDB course tiers table"
}

variable "dynamodb_enrollments_table" {
  type        = string
  description = "Name of the DynamoDB enrollments table"
}

variable "dynamodb_lessons_table" {
  type        = string
  description = "Name of the DynamoDB lessons table"
}

variable "dynamodb_progress_table" {
  type        = string
  description = "Name of the DynamoDB progress table"
}

variable "dynamodb_service_leads_table" {
  type        = string
  description = "Name of the DynamoDB service leads table"
}

variable "dynamodb_mentorship_sessions_table" {
  type        = string
  description = "Name of the DynamoDB mentorship sessions table"
}

variable "dynamodb_modules_table" {
  type        = string
  description = "Name of the DynamoDB modules table"
}

variable "cognito_user_pool_id" {
  type        = string
  description = "Cognito user pool ID"
}

variable "cognito_client_id" {
  type        = string
  description = "Cognito client ID"
}

variable "s3_videos_bucket" {
  type        = string
  description = "S3 videos bucket name"
}

variable "s3_documents_bucket" {
  type        = string
  description = "S3 documents bucket name"
}

variable "s3_frontend_bucket" {
  type        = string
  description = "S3 frontend bucket name"
}

variable "ses_configuration_set" {
  type        = string
  description = "SES configuration set name"
}

variable "sns_lead_notifications_topic" {
  type        = string
  description = "SNS topic ARN for lead notifications"
}

variable "sns_interview_reminders_topic" {
  type        = string
  description = "SNS topic ARN for interview reminders"
}

variable "sns_enrollment_confirmations_topic" {
  type        = string
  description = "SNS topic ARN for enrollment confirmations"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "cors_origins" {
  type        = list(string)
  description = "CORS allowed origins"
  default     = ["*"]
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources"
  default     = {}
}
