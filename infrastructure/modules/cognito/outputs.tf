output "user_pool_id" {
  value       = aws_cognito_user_pool.main.id
  description = "The ID of the Cognito user pool"
}

output "user_pool_arn" {
  value       = aws_cognito_user_pool.main.arn
  description = "The ARN of the Cognito user pool"
}

output "user_pool_client_id" {
  value       = aws_cognito_user_pool_client.main.id
  description = "The ID of the Cognito user pool client"
}

output "user_pool_domain_name" {
  value       = aws_cognito_user_pool_domain.main.domain
  description = "The domain name of the Cognito user pool"
}

output "admin_group_id" {
  value       = aws_cognito_user_group.admin.id
  description = "The ID of the admin group"
}

output "student_group_id" {
  value       = aws_cognito_user_group.student.id
  description = "The ID of the student group"
}
