variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources"
  default     = {}
}
