output "lead_notifications_topic_arn" {
  value       = aws_sns_topic.lead_notifications.arn
  description = "ARN of the lead notifications SNS topic"
}

output "lead_notifications_topic_name" {
  value       = aws_sns_topic.lead_notifications.name
  description = "Name of the lead notifications SNS topic"
}

output "interview_reminders_topic_arn" {
  value       = aws_sns_topic.interview_reminders.arn
  description = "ARN of the interview reminders SNS topic"
}

output "interview_reminders_topic_name" {
  value       = aws_sns_topic.interview_reminders.name
  description = "Name of the interview reminders SNS topic"
}

output "enrollment_confirmations_topic_arn" {
  value       = aws_sns_topic.enrollment_confirmations.arn
  description = "ARN of the enrollment confirmations SNS topic"
}

output "enrollment_confirmations_topic_name" {
  value       = aws_sns_topic.enrollment_confirmations.name
  description = "Name of the enrollment confirmations SNS topic"
}

output "lead_notifications_queue_url" {
  value       = aws_sqs_queue.lead_notifications.url
  description = "URL of the lead notifications SQS queue"
}

output "lead_notifications_queue_arn" {
  value       = aws_sqs_queue.lead_notifications.arn
  description = "ARN of the lead notifications SQS queue"
}

output "interview_reminders_queue_url" {
  value       = aws_sqs_queue.interview_reminders.url
  description = "URL of the interview reminders SQS queue"
}

output "interview_reminders_queue_arn" {
  value       = aws_sqs_queue.interview_reminders.arn
  description = "ARN of the interview reminders SQS queue"
}

output "enrollment_confirmations_queue_url" {
  value       = aws_sqs_queue.enrollment_confirmations.url
  description = "URL of the enrollment confirmations SQS queue"
}

output "enrollment_confirmations_queue_arn" {
  value       = aws_sqs_queue.enrollment_confirmations.arn
  description = "ARN of the enrollment confirmations SQS queue"
}

output "lead_notifications_dlq_url" {
  value       = aws_sqs_queue.lead_notifications_dlq.url
  description = "URL of the lead notifications DLQ"
}

output "interview_reminders_dlq_url" {
  value       = aws_sqs_queue.interview_reminders_dlq.url
  description = "URL of the interview reminders DLQ"
}

output "enrollment_confirmations_dlq_url" {
  value       = aws_sqs_queue.enrollment_confirmations_dlq.url
  description = "URL of the enrollment confirmations DLQ"
}
