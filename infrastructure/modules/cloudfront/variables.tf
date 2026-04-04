variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "s3_frontend_bucket_domain_name" {
  type        = string
  description = "Domain name of the S3 frontend bucket"
}

variable "cloudfront_oai_iam_arn" {
  type        = string
  description = "IAM ARN of the CloudFront origin access identity"
}

variable "cloudfront_oai_id" {
  type        = string
  description = "ID of the CloudFront origin access identity"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources"
  default     = {}
}
