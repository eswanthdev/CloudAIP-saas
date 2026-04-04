variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "sender_email" {
  type        = string
  description = "Email address to use as sender for SES"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources"
  default     = {}
}
