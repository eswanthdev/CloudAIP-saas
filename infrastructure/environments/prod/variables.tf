variable "aws_region" {
  type        = string
  description = "AWS region for deployment"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Environment name"
  default     = "prod"
}

variable "lambda_source_dir" {
  type        = string
  description = "Path to Lambda source code directory"
  default     = "../../../backend"
}

variable "lambda_layer_dir" {
  type        = string
  description = "Path to Lambda layer dependencies directory"
  default     = "../../../backend/layer"
}

variable "ses_sender_email" {
  type        = string
  description = "Email address to use as sender for SES"
}

variable "cognito_callback_urls" {
  type        = list(string)
  description = "OAuth callback URLs"
  default     = []
}

variable "cognito_logout_urls" {
  type        = list(string)
  description = "OAuth logout URLs"
  default     = []
}

variable "cors_origins" {
  type        = list(string)
  description = "CORS allowed origins"
  default     = []
}

variable "additional_tags" {
  type        = map(string)
  description = "Additional tags to apply to all resources"
  default     = {}
}
