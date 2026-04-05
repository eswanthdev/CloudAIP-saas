resource "aws_dynamodb_table" "users" {
  name         = "${var.environment}-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "courses" {
  name         = "${var.environment}-courses"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "id"
    type = "S"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "course_tiers" {
  name         = "${var.environment}-course-tiers"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "course_id"
    type = "S"
  }

  global_secondary_index {
    name            = "course-id-index"
    hash_key        = "course_id"
    projection_type = "ALL"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "enrollments" {
  name         = "${var.environment}-enrollments"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "course_id"
    type = "S"
  }

  global_secondary_index {
    name            = "user-id-index"
    hash_key        = "user_id"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "course-id-index"
    hash_key        = "course_id"
    projection_type = "ALL"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "lessons" {
  name         = "${var.environment}-lessons"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "module_id"
    type = "S"
  }

  global_secondary_index {
    name            = "module-id-index"
    hash_key        = "module_id"
    projection_type = "ALL"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "progress" {
  name         = "${var.environment}-progress"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "lesson_id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "lesson_id"
    type = "S"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "service_leads" {
  name         = "${var.environment}-service-leads"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "status-index"
    hash_key        = "status"
    projection_type = "ALL"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "mentorship_sessions" {
  name         = "${var.environment}-mentorship-sessions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "mentor_id"
    type = "S"
  }

  global_secondary_index {
    name            = "user-id-index"
    hash_key        = "user_id"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "mentor-id-index"
    hash_key        = "mentor_id"
    projection_type = "ALL"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "modules" {
  name         = "${var.environment}-modules"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  point_in_time_recovery {
    enabled = true
  }

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "course_id"
    type = "S"
  }

  global_secondary_index {
    name            = "course-id-index"
    hash_key        = "course_id"
    projection_type = "ALL"
  }

  tags = var.tags
}
