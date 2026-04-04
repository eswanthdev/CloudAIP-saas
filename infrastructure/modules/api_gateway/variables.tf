variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "lambda_function_arn" {
  type        = string
  description = "ARN of the Lambda function to integrate"
}

variable "lambda_function_name" {
  type        = string
  description = "Name of the Lambda function to integrate"
}

variable "cognito_user_pool_id" {
  type        = string
  description = "Cognito user pool ID"
}

variable "cognito_client_id" {
  type        = string
  description = "Cognito client ID"
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
