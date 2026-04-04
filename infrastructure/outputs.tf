# Root-level outputs are provided through environment-specific outputs
# For dev environment: See environments/dev/outputs.tf
# For prod environment: See environments/prod/outputs.tf

output "infrastructure_description" {
  value       = "FinOps SaaS Terraform Infrastructure - Configure environment in environments/dev or environments/prod"
  description = "Description of the infrastructure"
}
