variable "aws_region" {
  type        = string
  description = "AWS region for deployment"
  default     = "ap-south-1"
}

variable "environment" {
  type        = string
  description = "Environment name"
  default     = "dev"
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
  default     = ["http://localhost:3000/callback", "https://localhost:3000/callback"]
}

variable "cognito_logout_urls" {
  type        = list(string)
  description = "OAuth logout URLs"
  default     = ["http://localhost:3000/logout", "https://localhost:3000/logout"]
}

variable "cors_origins" {
  type        = list(string)
  description = "CORS allowed origins"
  default     = ["http://localhost:3000", "https://localhost:3000"]
}

variable "additional_tags" {
  type        = map(string)
  description = "Additional tags to apply to all resources"
  default     = {}
}
