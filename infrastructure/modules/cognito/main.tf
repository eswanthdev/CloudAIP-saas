resource "aws_cognito_user_pool" "main" {
  name = "${var.environment}-finops-pool"

  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  auto_verified_attributes   = ["email"]
  email_verification_subject = "FinOps SaaS Verification Code"
  email_verification_message = "Your verification code is {####}"

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  schema {
    attribute_data_type      = "String"
    name                     = "email"
    required                 = true
    mutable                  = true
    developer_only_attribute = false
  }

  schema {
    attribute_data_type      = "String"
    name                     = "role"
    required                 = false
    mutable                  = true
    developer_only_attribute = false
  }

  schema {
    attribute_data_type      = "String"
    name                     = "tier"
    required                 = false
    mutable                  = true
    developer_only_attribute = false
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = true
  }

  tags = var.tags
}

resource "aws_cognito_user_pool_client" "main" {
  name                                 = "${var.environment}-finops-client"
  user_pool_id                         = aws_cognito_user_pool.main.id
  explicit_auth_flows                  = ["ADMIN_NO_SRP_AUTH", "USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["openid", "profile", "email"]
  allowed_oauth_flows_user_pool_client = true
  callback_urls                        = var.callback_urls
  logout_urls                          = var.logout_urls

  read_attributes  = ["email", "custom:role", "custom:tier"]
  write_attributes = ["email", "custom:role", "custom:tier"]

  refresh_token_validity = 30
  token_validity_units {
    refresh_token = "days"
    access_token  = "hours"
    id_token      = "hours"
  }

  access_token_validity = 1
  id_token_validity     = 1

  enable_token_revocation       = true
  prevent_user_existence_errors = "ENABLED"

  depends_on = [aws_cognito_user_pool.main]
}

resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Admin users with full platform access"
}

resource "aws_cognito_user_group" "student" {
  name         = "student"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Student users with course access"
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.environment}-finops-${substr(aws_cognito_user_pool.main.id, 0, 8)}"
  user_pool_id = aws_cognito_user_pool.main.id
}
