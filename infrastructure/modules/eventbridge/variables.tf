variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "lambda_function_arn" {
  type        = string
  description = "ARN of the Lambda function to invoke"
}

variable "lambda_function_name" {
  type        = string
  description = "Name of the Lambda function to invoke"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources"
  default     = {}
}
