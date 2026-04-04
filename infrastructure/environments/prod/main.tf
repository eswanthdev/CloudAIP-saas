terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "finops-saas"
      ManagedBy   = "Terraform"
    }
  }
}

module "dynamodb" {
  source = "../../modules/dynamodb"

  environment = var.environment
  tags        = local.tags
}

module "cognito" {
  source = "../../modules/cognito"

  environment   = var.environment
  callback_urls = var.cognito_callback_urls
  logout_urls   = var.cognito_logout_urls
  tags          = local.tags
}

module "s3" {
  source = "../../modules/s3"

  environment  = var.environment
  cors_origins = var.cors_origins
  tags         = local.tags
}

module "iam" {
  source = "../../modules/iam"

  environment                = var.environment
  dynamodb_table_arns        = local.dynamodb_table_arns
  s3_videos_bucket_arn       = module.s3.videos_bucket_arn
  s3_documents_bucket_arn    = module.s3.documents_bucket_arn
  s3_frontend_bucket_arn     = module.s3.frontend_bucket_arn
  sns_topic_arns             = local.sns_topic_arns
  sqs_queue_arns             = local.sqs_queue_arns
  cognito_user_pool_arn      = module.cognito.user_pool_arn
  tags                       = local.tags
}

module "sns_sqs" {
  source = "../../modules/sns_sqs"

  environment = var.environment
  tags        = local.tags
}

module "ses" {
  source = "../../modules/ses"

  environment  = var.environment
  sender_email = var.ses_sender_email
  tags         = local.tags
}

module "lambda" {
  source = "../../modules/lambda"

  environment                         = var.environment
  lambda_source_dir                   = var.lambda_source_dir
  lambda_layer_dir                    = var.lambda_layer_dir
  lambda_execution_role_arn           = module.iam.lambda_execution_role_arn
  dynamodb_users_table                = module.dynamodb.users_table_name
  dynamodb_courses_table              = module.dynamodb.courses_table_name
  dynamodb_course_tiers_table         = module.dynamodb.course_tiers_table_name
  dynamodb_enrollments_table          = module.dynamodb.enrollments_table_name
  dynamodb_lessons_table              = module.dynamodb.lessons_table_name
  dynamodb_progress_table             = module.dynamodb.progress_table_name
  dynamodb_service_leads_table        = module.dynamodb.service_leads_table_name
  dynamodb_mentorship_sessions_table  = module.dynamodb.mentorship_sessions_table_name
  dynamodb_modules_table              = module.dynamodb.modules_table_name
  cognito_user_pool_id                = module.cognito.user_pool_id
  cognito_client_id                   = module.cognito.user_pool_client_id
  s3_videos_bucket                    = module.s3.videos_bucket_name
  s3_documents_bucket                 = module.s3.documents_bucket_name
  s3_frontend_bucket                  = module.s3.frontend_bucket_name
  ses_configuration_set               = module.ses.configuration_set_name
  sns_lead_notifications_topic        = module.sns_sqs.lead_notifications_topic_arn
  sns_interview_reminders_topic       = module.sns_sqs.interview_reminders_topic_arn
  sns_enrollment_confirmations_topic  = module.sns_sqs.enrollment_confirmations_topic_arn
  aws_region                          = var.aws_region
  cors_origins                        = var.cors_origins
  tags                                = local.tags
}

module "api_gateway" {
  source = "../../modules/api_gateway"

  environment            = var.environment
  lambda_function_arn    = module.lambda.lambda_function_arn
  lambda_function_name   = module.lambda.lambda_function_name
  cognito_user_pool_id   = module.cognito.user_pool_id
  cognito_client_id      = module.cognito.user_pool_client_id
  aws_region             = var.aws_region
  cors_origins           = var.cors_origins
  tags                   = local.tags
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  environment                      = var.environment
  s3_frontend_bucket_domain_name   = module.s3.frontend_bucket_domain_name
  cloudfront_oai_iam_arn           = module.s3.cloudfront_oai_iam_arn
  cloudfront_oai_id                = module.s3.cloudfront_oai_id
  tags                             = local.tags
}

module "eventbridge" {
  source = "../../modules/eventbridge"

  environment           = var.environment
  lambda_function_arn   = module.lambda.lambda_function_arn
  lambda_function_name  = module.lambda.lambda_function_name
  tags                  = local.tags
}

locals {
  tags = merge(
    var.additional_tags,
    {
      Environment = var.environment
      Project     = "finops-saas"
      ManagedBy   = "Terraform"
    }
  )

  dynamodb_table_arns = [
    module.dynamodb.users_table_arn,
    module.dynamodb.courses_table_arn,
    module.dynamodb.course_tiers_table_arn,
    module.dynamodb.enrollments_table_arn,
    module.dynamodb.lessons_table_arn,
    module.dynamodb.progress_table_arn,
    module.dynamodb.service_leads_table_arn,
    module.dynamodb.mentorship_sessions_table_arn,
    module.dynamodb.modules_table_arn
  ]

  sns_topic_arns = [
    module.sns_sqs.lead_notifications_topic_arn,
    module.sns_sqs.interview_reminders_topic_arn,
    module.sns_sqs.enrollment_confirmations_topic_arn
  ]

  sqs_queue_arns = [
    module.sns_sqs.lead_notifications_queue_arn,
    module.sns_sqs.interview_reminders_queue_arn,
    module.sns_sqs.enrollment_confirmations_queue_arn,
    module.sns_sqs.lead_notifications_dlq_url,
    module.sns_sqs.interview_reminders_dlq_url,
    module.sns_sqs.enrollment_confirmations_dlq_url
  ]
}
