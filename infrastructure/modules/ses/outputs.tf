output "configuration_set_name" {
  value       = aws_sesv2_configuration_set.main.configuration_set_name
  description = "Name of the SES configuration set"
}

output "sender_email" {
  value       = aws_sesv2_email_identity.welcome.email_identity
  description = "Verified sender email address"
}

output "welcome_template_name" {
  value       = aws_ses_template.welcome.name
  description = "Name of the welcome email template"
}

output "enrollment_confirmation_template_name" {
  value       = aws_ses_template.enrollment_confirmation.name
  description = "Name of the enrollment confirmation email template"
}

output "interview_reminder_template_name" {
  value       = aws_ses_template.interview_reminder.name
  description = "Name of the interview reminder email template"
}

output "lead_notification_template_name" {
  value       = aws_ses_template.lead_notification.name
  description = "Name of the lead notification email template"
}
