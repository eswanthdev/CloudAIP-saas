output "api_id" {
  value       = aws_apigatewayv2_api.main.id
  description = "API ID of the HTTP API"
}

output "api_endpoint" {
  value       = aws_apigatewayv2_api.main.api_endpoint
  description = "Endpoint URL of the HTTP API"
}

output "authorizer_id" {
  value       = aws_apigatewayv2_authorizer.cognito.id
  description = "ID of the Cognito authorizer"
}

output "stage_name" {
  value       = var.environment == "dev" ? aws_apigatewayv2_stage.dev[0].name : aws_apigatewayv2_stage.prod[0].name
  description = "Name of the API stage"
}
