variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "dynamodb_table_arns" {
  type        = list(string)
  description = "ARNs of all DynamoDB tables"
}

variable "s3_videos_bucket_arn" {
  type        = string
  description = "ARN of the S3 videos bucket"
}

variable "s3_documents_bucket_arn" {
  type        = string
  description = "ARN of the S3 documents bucket"
}

variable "s3_frontend_bucket_arn" {
  type        = string
  description = "ARN of the S3 frontend bucket"
}

variable "sns_topic_arns" {
  type        = list(string)
  description = "ARNs of SNS topics"
}

variable "sqs_queue_arns" {
  type        = list(string)
  description = "ARNs of SQS queues"
}

variable "cognito_user_pool_arn" {
  type        = string
  description = "ARN of the Cognito user pool"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources"
  default     = {}
}
