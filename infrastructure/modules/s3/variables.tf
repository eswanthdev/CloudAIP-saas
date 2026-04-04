variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
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
