# FinOps SaaS Infrastructure - Quick Start Guide

## Files Delivered

54 production-ready Terraform files covering complete AWS serverless infrastructure.

## Directory Structure

```
finops-saas/
├── INFRASTRUCTURE_SUMMARY.md          # Detailed summary
├── QUICK_START.md                     # This file
└── infrastructure/
    ├── README.md                      # Full documentation
    ├── main.tf                        # Provider config
    ├── variables.tf                   # Root variables
    ├── outputs.tf                     # Root outputs
    ├── modules/
    │   ├── dynamodb/                  # 9 DynamoDB tables
    │   ├── cognito/                   # User authentication
    │   ├── s3/                        # Storage buckets
    │   ├── lambda/                    # Serverless function
    │   ├── api_gateway/               # HTTP API
    │   ├── cloudfront/                # CDN distribution
    │   ├── eventbridge/               # Scheduled tasks
    │   ├── sns_sqs/                   # Message queues
    │   ├── ses/                       # Email service
    │   └── iam/                       # Security roles
    └── environments/
        ├── dev/                       # Development
        └── prod/                      # Production
```

## What's Included

### Core Services
- **DynamoDB**: 9 tables with GSIs, point-in-time recovery
- **Cognito**: User pool with OAuth, custom attributes
- **Lambda**: Python 3.11 with custom layer
- **API Gateway**: HTTP API with JWT auth
- **S3**: 3 buckets (videos, documents, frontend)
- **CloudFront**: CDN for static assets
- **EventBridge**: 3 scheduled rules for automation
- **SNS/SQS**: Message queues with DLQs
- **SES**: Email service with 4 templates
- **IAM**: Least-privilege roles

### Database Tables
1. users (PK: id, GSI: email)
2. courses (PK: id)
3. course_tiers (PK: id, GSI: course_id)
4. enrollments (PK: id, GSI: user_id, course_id)
5. lessons (PK: id, GSI: module_id)
6. progress (PK: user_id, SK: lesson_id)
7. service_leads (PK: id, GSI: status)
8. mentorship_sessions (PK: id, GSI: user_id, mentor_id)
9. modules (PK: id, GSI: course_id)

## One-Time Setup

```bash
# 1. Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket finops-saas-terraform-state \
  --region us-east-1 \
  --acl private

# 2. Enable versioning
aws s3api put-bucket-versioning \
  --bucket finops-saas-terraform-state \
  --versioning-configuration Status=Enabled

# 3. Create DynamoDB lock table
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# 4. Verify SES sender email
aws ses verify-email-identity \
  --email-address noreply@dev.finops-saas.example.com \
  --region us-east-1
```

## Deploy Development Environment

```bash
cd infrastructure/environments/dev

# Initialize
terraform init

# Set variables
export TF_VAR_ses_sender_email="noreply@dev.finops-saas.example.com"

# Create Lambda source directory
mkdir -p ../../../backend/layer

# Deploy
terraform plan -out=tfplan
terraform apply tfplan

# Get outputs
terraform output
```

## Deploy Production Environment

```bash
cd infrastructure/environments/prod

# Initialize
terraform init

# Set variables
export TF_VAR_ses_sender_email="noreply@finops-saas.example.com"
export TF_VAR_cognito_callback_urls='["https://finops-saas.example.com/callback"]'
export TF_VAR_cognito_logout_urls='["https://finops-saas.example.com/logout"]'
export TF_VAR_cors_origins='["https://finops-saas.example.com"]'

# Deploy
terraform plan -out=tfplan
terraform apply tfplan

# Get outputs
terraform output
```

## Key Outputs

After deployment, you'll get:
- Cognito User Pool ID
- Lambda Function URL
- API Gateway Endpoint
- CloudFront Domain Name
- S3 Bucket Names
- SNS Topic ARNs
- SQS Queue URLs

## Configuration Files

### Dev Environment
- `environments/dev/terraform.tfvars` - Uses localhost URLs
- Cognito callbacks: localhost:3000
- API CORS: localhost:3000

### Prod Environment
- `environments/prod/terraform.tfvars` - Uses production domain
- Cognito callbacks: https://finops-saas.example.com
- API CORS: https://finops-saas.example.com

## Email Templates

Four SES templates included:
1. **welcome.html/txt** - Account creation
2. **enrollment_confirmation.html/txt** - Course enrollment
3. **interview_reminder.html/txt** - Mock interview
4. **lead_notification.html/txt** - Sales lead

Templates use variable placeholders:
- {{name}}, {{email}}, {{company}}
- {{course_name}}, {{interview_date}}, etc.

## Security Features

✓ Least-privilege IAM roles
✓ S3 public access blocked (except frontend)
✓ DynamoDB point-in-time recovery
✓ SNS/SQS KMS encryption
✓ API Gateway JWT authorization
✓ CloudFront HTTPS only
✓ No hardcoded credentials
✓ DLQs for failed messages

## Monitoring

CloudWatch logs:
- `/aws/lambda/{env}-finops-backend` - Lambda logs
- `/aws/apigateway/{env}-finops` - API logs
- 14-day retention on all logs

## Common Commands

```bash
# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure
terraform destroy

# View outputs
terraform output

# Specific output
terraform output api_gateway_endpoint

# Validate syntax
terraform validate

# Format code
terraform fmt -recursive
```

## Customization

### Change Lambda Memory
Edit `modules/lambda/main.tf`:
```hcl
memory_size = 512  # Change this value
```

### Add DynamoDB Table
1. Add resource in `modules/dynamodb/main.tf`
2. Add output in `modules/dynamodb/outputs.tf`
3. Add to IAM policy in `modules/iam/main.tf`
4. Reference in `environments/*/main.tf`

### Change API Throttling
Edit `modules/api_gateway/main.tf`:
```hcl
throttle_settings {
  burst_limit = 100  # Requests per second burst
  rate_limit  = 50   # Sustained requests per second
}
```

### Modify EventBridge Schedule
Edit `modules/eventbridge/main.tf`:
```hcl
schedule_expression = "rate(1 hour)"  # Change frequency
```

## Troubleshooting

### "S3 bucket already exists"
```bash
# Try different region or check for existing bucket
aws s3 ls | grep finops
```

### "Cognito domain already exists"
The domain includes pool ID to avoid conflicts. Clear with:
```bash
aws cognito-idp delete-user-pool --user-pool-id <id> --region us-east-1
```

### "SES sandbox restrictions"
Verify sender email in dev:
```bash
aws ses verify-email-identity \
  --email-address noreply@dev.finops-saas.example.com \
  --region us-east-1
```

### Lambda function not deploying
Check source directory exists:
```bash
# Must have backend/main.py with handler function
ls -la backend/main.py
```

### Backend state lock issue
```bash
# View lock items
aws dynamodb scan --table-name terraform-locks --region us-east-1

# Remove stuck lock (if needed)
aws dynamodb delete-item \
  --table-name terraform-locks \
  --key '{"LockID":{"S":"path/to/resource"}}' \
  --region us-east-1
```

## Cost Estimates

Monthly estimates (US East 1):

- **DynamoDB**: ~$0 (pay-per-request, scales to zero)
- **Lambda**: Free tier covers 1M requests
- **S3**: ~$1-5 depending on storage
- **API Gateway**: ~$3.50 per million requests
- **CloudFront**: Varies by traffic
- **SNS/SQS**: Minimal (<$1)
- **SES**: $0.10 per 1,000 emails

**Total for dev**: ~$5-10/month
**Total for prod**: $15-50/month (depends on traffic)

## Next Steps

1. Create Lambda source code in `backend/main.py`
2. Set up Lambda layer dependencies in `backend/layer/`
3. Configure custom domain in Route 53
4. Enable WAF for API Gateway
5. Set up CloudWatch alarms
6. Configure backup strategy
7. Set up CI/CD pipeline

## Support Resources

- Full documentation: `infrastructure/README.md`
- Detailed summary: `INFRASTRUCTURE_SUMMARY.md`
- Terraform docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- AWS services: https://aws.amazon.com/

## Version Information

- Terraform: >= 1.0
- AWS Provider: ~> 5.0
- Region: us-east-1 (configurable)
- Python Runtime: 3.11

---

**Ready to deploy! Start with the Setup section above.**
