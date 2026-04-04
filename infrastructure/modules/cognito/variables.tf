variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "callback_urls" {
  type        = list(string)
  description = "OAuth callback URLs"
  default     = ["http://localhost:3000/callback"]
}

variable "logout_urls" {
  type        = list(string)
  description = "OAuth logout URLs"
  default     = ["http://localhost:3000/logout"]
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources"
  default     = {}
}
