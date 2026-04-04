output "dynamodb_users_table_name" {
  value       = module.dynamodb.users_table_name
  description = "Name of the DynamoDB users table"
}

output "dynamodb_courses_table_name" {
  value       = module.dynamodb.courses_table_name
  description = "Name of the DynamoDB courses table"
}

output "cognito_user_pool_id" {
  value       = module.cognito.user_pool_id
  description = "ID of the Cognito user pool"
}

output "cognito_user_pool_client_id" {
  value       = module.cognito.user_pool_client_id
  description = "ID of the Cognito user pool client"
}

output "cognito_domain" {
  value       = module.cognito.user_pool_domain_name
  description = "Domain of the Cognito user pool"
}

output "s3_videos_bucket_name" {
  value       = module.s3.videos_bucket_name
  description = "Name of the S3 videos bucket"
}

output "s3_documents_bucket_name" {
  value       = module.s3.documents_bucket_name
  description = "Name of the S3 documents bucket"
}

output "s3_frontend_bucket_name" {
  value       = module.s3.frontend_bucket_name
  description = "Name of the S3 frontend bucket"
}

output "lambda_function_name" {
  value       = module.lambda.lambda_function_name
  description = "Name of the Lambda function"
}

output "lambda_function_arn" {
  value       = module.lambda.lambda_function_arn
  description = "ARN of the Lambda function"
}

output "lambda_function_url" {
  value       = module.lambda.lambda_function_url
  description = "Function URL of the Lambda"
}

output "api_gateway_endpoint" {
  value       = module.api_gateway.api_endpoint
  description = "Endpoint URL of the HTTP API"
}

output "api_gateway_stage" {
  value       = module.api_gateway.stage_name
  description = "Name of the API stage"
}

output "cloudfront_distribution_domain" {
  value       = module.cloudfront.distribution_domain_name
  description = "Domain name of the CloudFront distribution"
}

output "cloudfront_distribution_id" {
  value       = module.cloudfront.distribution_id
  description = "ID of the CloudFront distribution"
}

output "sns_lead_notifications_topic_arn" {
  value       = module.sns_sqs.lead_notifications_topic_arn
  description = "ARN of the lead notifications SNS topic"
}

output "sns_interview_reminders_topic_arn" {
  value       = module.sns_sqs.interview_reminders_topic_arn
  description = "ARN of the interview reminders SNS topic"
}

output "sns_enrollment_confirmations_topic_arn" {
  value       = module.sns_sqs.enrollment_confirmations_topic_arn
  description = "ARN of the enrollment confirmations SNS topic"
}

output "sqs_lead_notifications_queue_url" {
  value       = module.sns_sqs.lead_notifications_queue_url
  description = "URL of the lead notifications SQS queue"
}

output "sqs_interview_reminders_queue_url" {
  value       = module.sns_sqs.interview_reminders_queue_url
  description = "URL of the interview reminders SQS queue"
}

output "sqs_enrollment_confirmations_queue_url" {
  value       = module.sns_sqs.enrollment_confirmations_queue_url
  description = "URL of the enrollment confirmations SQS queue"
}

output "ses_configuration_set_name" {
  value       = module.ses.configuration_set_name
  description = "Name of the SES configuration set"
}

output "ses_sender_email" {
  value       = module.ses.sender_email
  description = "Verified sender email address"
}
