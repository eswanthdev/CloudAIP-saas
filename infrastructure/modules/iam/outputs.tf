output "lambda_execution_role_arn" {
  value       = aws_iam_role.lambda_execution.arn
  description = "ARN of the Lambda execution role"
}

output "lambda_execution_role_name" {
  value       = aws_iam_role.lambda_execution.name
  description = "Name of the Lambda execution role"
}

output "api_gateway_role_arn" {
  value       = aws_iam_role.api_gateway.arn
  description = "ARN of the API Gateway role"
}

output "api_gateway_role_name" {
  value       = aws_iam_role.api_gateway.name
  description = "Name of the API Gateway role"
}
