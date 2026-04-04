output "lambda_function_arn" {
  value       = aws_lambda_function.backend.arn
  description = "ARN of the Lambda function"
}

output "lambda_function_name" {
  value       = aws_lambda_function.backend.function_name
  description = "Name of the Lambda function"
}

output "lambda_function_qualified_arn" {
  value       = aws_lambda_function.backend.qualified_arn
  description = "Qualified ARN of the Lambda function"
}

output "lambda_layer_arn" {
  value       = aws_lambda_layer_version.dependencies.arn
  description = "ARN of the Lambda layer"
}

output "lambda_function_url" {
  value       = aws_lambda_function_url.backend.function_url
  description = "Function URL of the Lambda"
}

output "cloudwatch_log_group_name" {
  value       = aws_cloudwatch_log_group.lambda.name
  description = "Name of the CloudWatch log group"
}
