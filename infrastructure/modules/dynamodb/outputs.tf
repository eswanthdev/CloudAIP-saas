output "users_table_name" {
  value       = aws_dynamodb_table.users.name
  description = "Name of the users table"
}

output "courses_table_name" {
  value       = aws_dynamodb_table.courses.name
  description = "Name of the courses table"
}

output "course_tiers_table_name" {
  value       = aws_dynamodb_table.course_tiers.name
  description = "Name of the course tiers table"
}

output "enrollments_table_name" {
  value       = aws_dynamodb_table.enrollments.name
  description = "Name of the enrollments table"
}

output "lessons_table_name" {
  value       = aws_dynamodb_table.lessons.name
  description = "Name of the lessons table"
}

output "progress_table_name" {
  value       = aws_dynamodb_table.progress.name
  description = "Name of the progress table"
}

output "service_leads_table_name" {
  value       = aws_dynamodb_table.service_leads.name
  description = "Name of the service leads table"
}

output "mentorship_sessions_table_name" {
  value       = aws_dynamodb_table.mentorship_sessions.name
  description = "Name of the mentorship sessions table"
}

output "modules_table_name" {
  value       = aws_dynamodb_table.modules.name
  description = "Name of the modules table"
}

output "users_table_arn" {
  value       = aws_dynamodb_table.users.arn
  description = "ARN of the users table"
}

output "courses_table_arn" {
  value       = aws_dynamodb_table.courses.arn
  description = "ARN of the courses table"
}

output "course_tiers_table_arn" {
  value       = aws_dynamodb_table.course_tiers.arn
  description = "ARN of the course tiers table"
}

output "enrollments_table_arn" {
  value       = aws_dynamodb_table.enrollments.arn
  description = "ARN of the enrollments table"
}

output "lessons_table_arn" {
  value       = aws_dynamodb_table.lessons.arn
  description = "ARN of the lessons table"
}

output "progress_table_arn" {
  value       = aws_dynamodb_table.progress.arn
  description = "ARN of the progress table"
}

output "service_leads_table_arn" {
  value       = aws_dynamodb_table.service_leads.arn
  description = "ARN of the service leads table"
}

output "mentorship_sessions_table_arn" {
  value       = aws_dynamodb_table.mentorship_sessions.arn
  description = "ARN of the mentorship sessions table"
}

output "modules_table_arn" {
  value       = aws_dynamodb_table.modules.arn
  description = "ARN of the modules table"
}
