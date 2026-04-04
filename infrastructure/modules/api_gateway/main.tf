resource "aws_apigatewayv2_api" "main" {
  name          = "${var.environment}-finops-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_credentials = true
    allow_headers = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins = var.cors_origins
    expose_headers = ["x-amzn-RequestId"]
    max_age = 300
  }

  tags = var.tags
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  name             = "${var.environment}-cognito-authorizer"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = [var.cognito_client_id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  payload_format_version = "2.0"
  target                 = var.lambda_function_arn
}

resource "aws_apigatewayv2_route" "default" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "$default"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "health" {
  api_id     = aws_apigatewayv2_api.main.id
  route_key  = "GET /health"
  target     = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  depends_on = [aws_apigatewayv2_integration.lambda]
}

resource "aws_apigatewayv2_stage" "dev" {
  count           = var.environment == "dev" ? 1 : 0
  api_id          = aws_apigatewayv2_api.main.id
  name            = "dev"
  auto_deploy     = true
  stage_variables = {
    environment = "dev"
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  throttle_settings {
    burst_limit = 100
    rate_limit  = 50
  }

  tags = var.tags

  depends_on = [aws_cloudwatch_log_group.api_gateway]
}

resource "aws_apigatewayv2_stage" "prod" {
  count           = var.environment == "prod" ? 1 : 0
  api_id          = aws_apigatewayv2_api.main.id
  name            = "prod"
  auto_deploy     = true
  stage_variables = {
    environment = "prod"
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  throttle_settings {
    burst_limit = 500
    rate_limit  = 200
  }

  tags = var.tags

  depends_on = [aws_cloudwatch_log_group.api_gateway]
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.environment}-finops"
  retention_in_days = 14

  tags = var.tags
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
