resource "aws_cloudwatch_event_rule" "mock_interview_scheduling" {
  name                = "${var.environment}-mock-interview-scheduling"
  description         = "Rule to trigger mock interview scheduling Lambda"
  schedule_expression = "rate(1 hour)"
  state               = "ENABLED"

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "mock_interview_lambda" {
  rule      = aws_cloudwatch_event_rule.mock_interview_scheduling.name
  target_id = "MockInterviewLambda"
  arn       = var.lambda_function_arn
}

resource "aws_lambda_permission" "mock_interview_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge-MockInterview"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.mock_interview_scheduling.arn
}

resource "aws_cloudwatch_event_rule" "mentorship_reminders" {
  name                = "${var.environment}-mentorship-reminders"
  description         = "Rule to trigger mentorship session reminder Lambda"
  schedule_expression = "rate(30 minutes)"
  state               = "ENABLED"

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "mentorship_reminders_lambda" {
  rule      = aws_cloudwatch_event_rule.mentorship_reminders.name
  target_id = "MentorshipRemindersLambda"
  arn       = var.lambda_function_arn
}

resource "aws_lambda_permission" "mentorship_reminders_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge-MentorshipReminders"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.mentorship_reminders.arn
}

resource "aws_cloudwatch_event_rule" "enrollment_notifications" {
  name                = "${var.environment}-enrollment-notifications"
  description         = "Rule to trigger enrollment notification Lambda"
  schedule_expression = "rate(5 minutes)"
  state               = "ENABLED"

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "enrollment_notifications_lambda" {
  rule      = aws_cloudwatch_event_rule.enrollment_notifications.name
  target_id = "EnrollmentNotificationsLambda"
  arn       = var.lambda_function_arn
}

resource "aws_lambda_permission" "enrollment_notifications_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge-EnrollmentNotifications"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.enrollment_notifications.arn
}
