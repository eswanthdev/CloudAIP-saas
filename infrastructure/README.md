# FinOps SaaS Infrastructure

Complete production-ready Terraform infrastructure for the FinOps SaaS platform using AWS serverless services.

## Architecture Overview

This infrastructure creates a fully serverless application on AWS with:

- **DynamoDB**: NoSQL database with point-in-time recovery for all data
- **Cognito**: User authentication and management with custom attributes
- **Lambda**: Serverless compute with FastAPI backend
- **API Gateway**: HTTP API with Cognito authorization
- **S3**: Storage for videos, documents, and frontend assets
- **CloudFront**: CDN for frontend distribution
- **EventBridge**: Scheduled tasks for mock interviews and reminders
- **SNS/SQS**: Message queuing for asynchronous processing
- **SES**: Email delivery for notifications
- **IAM**: Fine-grained least-privilege access controls

## Project Structure

```
infrastructure/
├── modules/
│   ├── dynamodb/          # DynamoDB tables (9 tables)
│   ├── cognito/           # User authentication
│   ├── s3/                # S3 buckets and CloudFront OAI
│   ├── lambda/            # Lambda function and layer
│   ├── api_gateway/       # HTTP API with Cognito auth
│   ├── cloudfront/        # CDN distribution
│   ├── eventbridge/       # Scheduled rules
│   ├── sns_sqs/           # Message queues
│   ├── ses/               # Email templates and config
│   └── iam/               # Roles and policies
├── environments/
│   ├── dev/               # Development environment
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   ├── backend.tf
│   │   └── outputs.tf
│   └── prod/              # Production environment
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       ├── backend.tf
│       └── outputs.tf
├── main.tf
├── variables.tf
└── outputs.tf
```

## DynamoDB Tables

All tables use PAY_PER_REQUEST billing and point-in-time recovery:

1. **users**: User accounts (PK: id, GSI: email)
2. **courses**: Course catalog (PK: id)
3. **course_tiers**: Pricing tiers (PK: id, GSI: course_id)
4. **enrollments**: Student enrollments (PK: id, GSI: user_id, GSI: course_id)
5. **lessons**: Course lessons (PK: id, GSI: module_id)
6. **progress**: Student progress (PK: user_id, SK: lesson_id)
7. **service_leads**: Sales leads (PK: id, GSI: status)
8. **mentorship_sessions**: Mentor sessions (PK: id, GSI: user_id, GSI: mentor_id)
9. **modules**: Course modules (PK: id, GSI: course_id)

## S3 Buckets

1. **Videos Bucket**: Private, versioned, lifecycle retention (30 days)
2. **Documents Bucket**: Private, versioned, archival to Glacier (90 days)
3. **Frontend Bucket**: Public through CloudFront, SPA routing

## Cognito Configuration

- User pool with email verification
- Custom attributes: role (student/admin/client), tier
- OAuth flows with callback URLs
- Two user groups: admin, student
- Enforced password policy: 12+ chars, upper, lower, number, symbol

## Lambda Setup

- Python 3.11 runtime
- 512 MB memory, 30 second timeout
- Custom layer for dependencies
- CloudWatch logs with 14-day retention
- Function URL for direct invocation
- Environment variables for all AWS resources

## API Gateway

- HTTP API (v2) for better performance
- JWT authorization via Cognito
- CORS configuration
- Environment-specific throttling:
  - Dev: 100 burst, 50 requests/sec
  - Prod: 500 burst, 200 requests/sec

## EventBridge Rules

Three scheduled rules for automation:

1. **Mock Interview Scheduling**: Every 1 hour
2. **Mentorship Reminders**: Every 30 minutes
3. **Enrollment Notifications**: Every 5 minutes

## SNS/SQS Integration

Three SNS topics with SQS queues and dead-letter queues:

1. **Lead Notifications**: Sales lead alerts
2. **Interview Reminders**: Mock interview reminders
3. **Enrollment Confirmations**: Course enrollment notifications

All messages encrypted with KMS.

## SES Email Templates

Four email templates:

1. **Welcome**: Account creation confirmation
2. **Enrollment Confirmation**: Course enrollment notification
3. **Interview Reminder**: Mock interview scheduling reminder
4. **Lead Notification**: Sales lead notification

## IAM Security

Least-privilege principle applied:

- **Lambda Execution Role**: DynamoDB, S3, SES, SNS, SQS, CloudWatch, Cognito access
- **API Gateway Role**: CloudWatch logs access
- Policies scoped to specific resources
- No wildcard permissions

## Deployment

### Prerequisites

1. AWS account with appropriate permissions
2. Terraform >= 1.0
3. AWS CLI configured
4. S3 backend bucket for state (create manually)

### Backend Setup

Create the S3 bucket and DynamoDB table for Terraform state:

```bash
# Create S3 bucket for state
aws s3api create-bucket \
  --bucket finops-saas-terraform-state \
  --region us-east-1 \
  --acl private

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket finops-saas-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for locks
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Deploy Dev Environment

```bash
cd environments/dev

# Initialize Terraform
terraform init

# Set required variables
export TF_VAR_ses_sender_email="noreply@dev.finops-saas.example.com"

# Create Lambda source directories
mkdir -p ../../backend/layer

# Plan and apply
terraform plan -out=tfplan
terraform apply tfplan
```

### Deploy Prod Environment

```bash
cd environments/prod

# Initialize Terraform
terraform init

# Set required variables
export TF_VAR_ses_sender_email="noreply@finops-saas.example.com"
export TF_VAR_cognito_callback_urls='["https://finops-saas.example.com/callback"]'
export TF_VAR_cognito_logout_urls='["https://finops-saas.example.com/logout"]'
export TF_VAR_cors_origins='["https://finops-saas.example.com"]'

# Plan and apply
terraform plan -out=tfplan
terraform apply tfplan
```

## Environment-Specific Configurations

### Development Environment (`environments/dev`)

- Uses localhost URLs for Cognito
- CORS allows localhost:3000
- Smaller Lambda memory (512 MB)
- Lower API throttling limits

### Production Environment (`environments/prod`)

- Uses production domain (finops-saas.example.com)
- Stricter CORS configuration
- Production email addresses
- Higher API throttling limits

## Key Outputs

Both environments output:

- DynamoDB table names
- Cognito user pool ID and domain
- S3 bucket names
- Lambda function ARN and URL
- API Gateway endpoint
- CloudFront distribution domain
- SNS topic ARNs
- SQS queue URLs
- SES configuration

## Security Considerations

1. **S3 Buckets**: Public access blocked on video/documents buckets
2. **DynamoDB**: Point-in-time recovery enabled
3. **Encryption**: All SNS/SQS messages encrypted with KMS
4. **IAM**: Least-privilege roles with specific resource ARNs
5. **API Gateway**: JWT authorization via Cognito
6. **Lambda**: Environment variables, no hardcoded credentials

## Customization

### Adding a DynamoDB Table

1. Add table resource in `modules/dynamodb/main.tf`
2. Add output in `modules/dynamodb/outputs.tf`
3. Reference in IAM policy in `modules/iam/main.tf`

### Adding a Lambda Permission

1. Add policy in `modules/iam/main.tf`
2. Attach to Lambda execution role
3. Test with least-privilege approach

### Modifying Email Templates

Templates are in `modules/ses/templates/`. Update template files and redeploy:

```bash
terraform apply
```

## Troubleshooting

### Lambda Function Not Deploying

Ensure `lambda_source_dir` points to valid directory with `main.py` and handler function.

### Cognito Domain Already Exists

The domain includes the user pool ID to avoid conflicts. Clear previous attempts:

```bash
aws cognito-idp delete-user-pool --user-pool-id <id>
```

### S3 Backend Errors

Verify backend bucket exists and is accessible:

```bash
aws s3 ls s3://finops-saas-terraform-state/
```

### SES Sandbox Restrictions

In development, SES is in sandbox mode. Verify sender email:

```bash
aws ses verify-email-identity --email-address noreply@dev.finops-saas.example.com
```

## Cost Optimization

- DynamoDB: Pay-per-request billing (scales to zero when not in use)
- Lambda: Free tier covers up to 1M requests/month
- S3: Infrequent Access tier available for documents after 90 days
- CloudFront: Minimal cost for small to medium traffic
- SNS/SQS: Minimal cost for message queuing

## Monitoring and Logging

All services write to CloudWatch:

- Lambda logs: `/aws/lambda/{environment}-finops-backend`
- API Gateway logs: `/aws/apigateway/{environment}-finops`
- 14-day retention on all log groups

## Next Steps

1. Configure Lambda source code in `backend/` directory
2. Set up CI/CD pipeline for infrastructure changes
3. Configure custom domain for API Gateway
4. Set up Route 53 for DNS management
5. Enable WAF for API Gateway protection
