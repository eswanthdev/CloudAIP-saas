resource "aws_sns_topic" "lead_notifications" {
  name              = "${var.environment}-lead-notifications"
  kms_master_key_id = "alias/aws/sns"

  tags = var.tags
}

resource "aws_sns_topic_policy" "lead_notifications" {
  arn = aws_sns_topic.lead_notifications.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.lead_notifications.arn
      }
    ]
  })
}

resource "aws_sns_topic" "interview_reminders" {
  name              = "${var.environment}-interview-reminders"
  kms_master_key_id = "alias/aws/sns"

  tags = var.tags
}

resource "aws_sns_topic_policy" "interview_reminders" {
  arn = aws_sns_topic.interview_reminders.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.interview_reminders.arn
      }
    ]
  })
}

resource "aws_sns_topic" "enrollment_confirmations" {
  name              = "${var.environment}-enrollment-confirmations"
  kms_master_key_id = "alias/aws/sns"

  tags = var.tags
}

resource "aws_sns_topic_policy" "enrollment_confirmations" {
  arn = aws_sns_topic.enrollment_confirmations.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.enrollment_confirmations.arn
      }
    ]
  })
}

resource "aws_sqs_queue" "lead_notifications_dlq" {
  name                      = "${var.environment}-lead-notifications-dlq"
  message_retention_seconds = 1209600
  kms_master_key_id         = "alias/aws/sqs"

  tags = var.tags
}

resource "aws_sqs_queue" "lead_notifications" {
  name                       = "${var.environment}-lead-notifications"
  message_retention_seconds  = 345600
  visibility_timeout_seconds = 300
  kms_master_key_id          = "alias/aws/sqs"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.lead_notifications_dlq.arn
    maxReceiveCount     = 3
  })

  tags = var.tags
}

resource "aws_sqs_queue_policy" "lead_notifications" {
  queue_url = aws_sqs_queue.lead_notifications.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.lead_notifications.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.lead_notifications.arn
          }
        }
      }
    ]
  })
}

resource "aws_sns_topic_subscription" "lead_notifications_to_sqs" {
  topic_arn = aws_sns_topic.lead_notifications.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.lead_notifications.arn
}

resource "aws_sqs_queue" "interview_reminders_dlq" {
  name                      = "${var.environment}-interview-reminders-dlq"
  message_retention_seconds = 1209600
  kms_master_key_id         = "alias/aws/sqs"

  tags = var.tags
}

resource "aws_sqs_queue" "interview_reminders" {
  name                       = "${var.environment}-interview-reminders"
  message_retention_seconds  = 345600
  visibility_timeout_seconds = 300
  kms_master_key_id          = "alias/aws/sqs"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.interview_reminders_dlq.arn
    maxReceiveCount     = 3
  })

  tags = var.tags
}

resource "aws_sqs_queue_policy" "interview_reminders" {
  queue_url = aws_sqs_queue.interview_reminders.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.interview_reminders.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.interview_reminders.arn
          }
        }
      }
    ]
  })
}

resource "aws_sns_topic_subscription" "interview_reminders_to_sqs" {
  topic_arn = aws_sns_topic.interview_reminders.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.interview_reminders.arn
}

resource "aws_sqs_queue" "enrollment_confirmations_dlq" {
  name                      = "${var.environment}-enrollment-confirmations-dlq"
  message_retention_seconds = 1209600
  kms_master_key_id         = "alias/aws/sqs"

  tags = var.tags
}

resource "aws_sqs_queue" "enrollment_confirmations" {
  name                       = "${var.environment}-enrollment-confirmations"
  message_retention_seconds  = 345600
  visibility_timeout_seconds = 300
  kms_master_key_id          = "alias/aws/sqs"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.enrollment_confirmations_dlq.arn
    maxReceiveCount     = 3
  })

  tags = var.tags
}

resource "aws_sqs_queue_policy" "enrollment_confirmations" {
  queue_url = aws_sqs_queue.enrollment_confirmations.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.enrollment_confirmations.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.enrollment_confirmations.arn
          }
        }
      }
    ]
  })
}

resource "aws_sns_topic_subscription" "enrollment_confirmations_to_sqs" {
  topic_arn = aws_sns_topic.enrollment_confirmations.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.enrollment_confirmations.arn
}
