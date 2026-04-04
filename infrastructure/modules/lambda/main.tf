data "archive_file" "lambda_source" {
  type        = "zip"
  source_dir  = var.lambda_source_dir
  output_path = "${path.module}/lambda_function.zip"
}

data "archive_file" "lambda_layer" {
  type        = "zip"
  source_dir  = var.lambda_layer_dir
  output_path = "${path.module}/lambda_layer.zip"
}

resource "aws_lambda_layer_version" "dependencies" {
  filename            = data.archive_file.lambda_layer.output_path
  layer_name          = "${var.environment}-finops-dependencies"
  compatible_runtimes = ["python3.11"]
  source_code_hash    = data.archive_file.lambda_layer.output_base64sha256

  depends_on = [data.archive_file.lambda_layer]
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.environment}-finops-backend"
  retention_in_days = 14

  tags = var.tags
}

resource "aws_lambda_function" "backend" {
  filename      = data.archive_file.lambda_source.output_path
  function_name = "${var.environment}-finops-backend"
  role          = var.lambda_execution_role_arn
  handler       = "main.handler"
  runtime       = "python3.11"
  timeout       = 30
  memory_size   = 512

  source_code_hash = data.archive_file.lambda_source.output_base64sha256

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      ENVIRONMENT                     = var.environment
      USERS_TABLE                     = var.dynamodb_users_table
      COURSES_TABLE                   = var.dynamodb_courses_table
      COURSE_TIERS_TABLE              = var.dynamodb_course_tiers_table
      ENROLLMENTS_TABLE               = var.dynamodb_enrollments_table
      LESSONS_TABLE                   = var.dynamodb_lessons_table
      PROGRESS_TABLE                  = var.dynamodb_progress_table
      SERVICE_LEADS_TABLE             = var.dynamodb_service_leads_table
      MENTORSHIP_SESSIONS_TABLE       = var.dynamodb_mentorship_sessions_table
      MODULES_TABLE                   = var.dynamodb_modules_table
      COGNITO_USER_POOL_ID            = var.cognito_user_pool_id
      COGNITO_CLIENT_ID               = var.cognito_client_id
      VIDEOS_BUCKET                   = var.s3_videos_bucket
      DOCUMENTS_BUCKET                = var.s3_documents_bucket
      FRONTEND_BUCKET                 = var.s3_frontend_bucket
      SES_CONFIGURATION_SET           = var.ses_configuration_set
      SNS_LEAD_NOTIFICATIONS_TOPIC    = var.sns_lead_notifications_topic
      SNS_INTERVIEW_REMINDERS_TOPIC   = var.sns_interview_reminders_topic
      SNS_ENROLLMENT_CONFIRMATIONS_TOPIC = var.sns_enrollment_confirmations_topic
      AWS_REGION                      = var.aws_region
    }
  }

  depends_on = [
    aws_lambda_layer_version.dependencies,
    aws_cloudwatch_log_group.lambda
  ]

  tags = var.tags
}

resource "aws_lambda_function_url" "backend" {
  function_name          = aws_lambda_function.backend.function_name
  authorization_type    = "NONE"
  cors {
    allow_origins = var.cors_origins
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Date", "x-amz-date", "Content-Type", "X-Amz-Content-Sha256", "Authorization", "X-Api-Key", "X-Amz-Security-Token", "X-Amz-User-Agent"]
    expose_headers = ["x-amzn-RequestId"]
    max_age       = 86400
  }
}

resource "aws_cloudwatch_log_group" "lambda_insights" {
  name              = "/aws/lambda-insights:${aws_lambda_function.backend.function_name}"
  retention_in_days = 14

  tags = var.tags
}
