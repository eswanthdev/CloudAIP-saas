resource "aws_sesv2_configuration_set" "main" {
  configuration_set_name = "${var.environment}-finops-config-set"

  delivery_options {
    tls_policy = "Require"
  }

  reputation_options {
    reputation_metrics_enabled = true
  }

  sending_options {
    tls_policy = "Require"
  }

  tags = var.tags
}

resource "aws_sesv2_email_identity" "welcome" {
  email_address = var.sender_email

  authentication_attributes {
    hosted_authentication_status = "SUCCESS"
  }

  tags = var.tags
}

resource "aws_ses_email_identity" "sender" {
  email = var.sender_email
}

resource "aws_ses_email_identity_attributes" "sender" {
  email_address = var.sender_email

  sending_pool_name = "default"
}

resource "aws_ses_template" "welcome" {
  name    = "${var.environment}-welcome-email"
  subject = "Welcome to FinOps SaaS"
  html    = file("${path.module}/templates/welcome.html")
  text    = file("${path.module}/templates/welcome.txt")
}

resource "aws_ses_template" "enrollment_confirmation" {
  name    = "${var.environment}-enrollment-confirmation"
  subject = "Enrollment Confirmed"
  html    = file("${path.module}/templates/enrollment_confirmation.html")
  text    = file("${path.module}/templates/enrollment_confirmation.txt")
}

resource "aws_ses_template" "interview_reminder" {
  name    = "${var.environment}-interview-reminder"
  subject = "Reminder: Your Interview is Coming Up"
  html    = file("${path.module}/templates/interview_reminder.html")
  text    = file("${path.module}/templates/interview_reminder.txt")
}

resource "aws_ses_template" "lead_notification" {
  name    = "${var.environment}-lead-notification"
  subject = "New Lead Notification"
  html    = file("${path.module}/templates/lead_notification.html")
  text    = file("${path.module}/templates/lead_notification.txt")
}

resource "aws_sesv2_account_suppression_attributes" "main" {
  account_suppression_attributes {
    suppressed_reasons = ["BOUNCE", "COMPLAINT"]
  }
}
