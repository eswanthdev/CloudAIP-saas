output "mock_interview_rule_arn" {
  value       = aws_cloudwatch_event_rule.mock_interview_scheduling.arn
  description = "ARN of the mock interview scheduling rule"
}

output "mentorship_reminders_rule_arn" {
  value       = aws_cloudwatch_event_rule.mentorship_reminders.arn
  description = "ARN of the mentorship reminders rule"
}

output "enrollment_notifications_rule_arn" {
  value       = aws_cloudwatch_event_rule.enrollment_notifications.arn
  description = "ARN of the enrollment notifications rule"
}
