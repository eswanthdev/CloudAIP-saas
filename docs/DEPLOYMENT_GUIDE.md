# FinOps SaaS Platform - Complete Deployment Guide

## Table of Contents
1. Prerequisites
2. Local Development Setup
3. AWS Account Preparation
4. Infrastructure Deployment (Terraform)
5. Backend Deployment (Lambda)
6. Frontend Deployment (S3 + CloudFront)
7. GitHub Repository Setup
8. CI/CD Pipeline Configuration
9. Post-Deployment Verification
10. Troubleshooting

---

## 1. Prerequisites

### Tools Required
- **AWS CLI** v2+ configured with admin credentials
- **Terraform** v1.6.0+
- **Node.js** v18+ and npm v9+
- **Python** v3.11+
- **Docker** and Docker Compose (for local development)
- **Git** v2.30+
- **GitHub CLI** (gh) for repository setup

### AWS Services Used
- Lambda, API Gateway, DynamoDB, S3, CloudFront
- Cognito, SES, SNS, SQS, EventBridge
- IAM, CloudWatch

### Accounts Required
- AWS Account with admin access
- GitHub Account
- Razorpay Account (https://dashboard.razorpay.com)

---

## 2. Local Development Setup

### Step 2.1: Clone and Install
```bash
git clone https://github.com/YOUR_ORG/finops-saas.git
cd finops-saas

# One-command setup
make setup
```

### Step 2.2: Configure Environment Files
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your values
```

### Step 2.3: Start Local Stack
```bash
# Terminal 1: Start DynamoDB Local + LocalStack
make docker-up

# Terminal 2: Start Backend
make backend-dev
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs

# Terminal 3: Start Frontend
make frontend-dev
# App available at http://localhost:3000
```

---

## 3. AWS Account Preparation

### Step 3.1: Create Terraform State Bucket
```bash
aws s3 mb s3://finops-saas-terraform-state --region ap-south-1
aws s3api put-bucket-versioning \
  --bucket finops-saas-terraform-state \
  --versioning-configuration Status=Enabled
```

### Step 3.2: Create Deployment Artifacts Bucket
```bash
aws s3 mb s3://finops-saas-deployments --region ap-south-1
```

### Step 3.3: Verify SES Email (for notifications)
```bash
aws ses verify-email-identity \
  --email-address noreply@yourdomain.com \
  --region ap-south-1
```

### Step 3.4: Create OIDC Provider for GitHub Actions
```bash
# Create OIDC provider
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com" \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1"

# Create IAM role for GitHub Actions
aws iam create-role \
  --role-name github-actions-finops-saas \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/finops-saas:*"
        }
      }
    }]
  }'

# Attach required policies
aws iam attach-role-policy \
  --role-name github-actions-finops-saas \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name github-actions-finops-saas \
  --policy-arn arn:aws:iam::aws:policy/AWSLambda_FullAccess

aws iam attach-role-policy \
  --role-name github-actions-finops-saas \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

aws iam attach-role-policy \
  --role-name github-actions-finops-saas \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```

---

## 4. Infrastructure Deployment (Terraform)

### Step 4.1: Initialize Dev Environment
```bash
cd infrastructure/environments/dev

# Update terraform.tfvars with your values
# Edit: project_name, environment, aws_region, ses_email_identity

terraform init
terraform plan
```

### Step 4.2: Apply Dev Infrastructure
```bash
terraform apply

# Save the outputs - you will need them for backend/frontend config
terraform output -json > ../../dev-outputs.json
```

### Step 4.3: Note Key Outputs
After applying, note these values:
- `cognito_user_pool_id`
- `cognito_client_id`
- `api_gateway_endpoint`
- `cloudfront_domain`
- `s3_frontend_bucket`
- `s3_video_bucket`
- `s3_documents_bucket`

### Step 4.4: Deploy Production (when ready)
```bash
cd infrastructure/environments/prod
terraform init
terraform plan
terraform apply
```

---

## 5. Backend Deployment (Lambda)

### Step 5.1: Update Backend Config
Update `backend/.env` with Terraform outputs:
```bash
COGNITO_USER_POOL_ID=<from terraform output>
COGNITO_CLIENT_ID=<from terraform output>
S3_VIDEO_BUCKET=<from terraform output>
S3_DOCUMENTS_BUCKET=<from terraform output>
RAZORPAY_KEY_ID=<from razorpay dashboard>
RAZORPAY_KEY_SECRET=<from razorpay dashboard>
```

### Step 5.2: Package for Lambda
```bash
cd backend
bash deploy.sh
# This creates lambda-function.zip and lambda-layer.zip
```

### Step 5.3: Deploy Lambda Layer
```bash
aws s3 cp lambda-layer.zip s3://finops-saas-deployments/dev/lambda-layer.zip

aws lambda publish-layer-version \
  --layer-name finops-saas-dev-dependencies \
  --content S3Bucket=finops-saas-deployments,S3Key=dev/lambda-layer.zip \
  --compatible-runtimes python3.11
```

### Step 5.4: Deploy Lambda Function
```bash
aws s3 cp lambda-function.zip s3://finops-saas-deployments/dev/lambda-function.zip

aws lambda update-function-code \
  --function-name finops-saas-dev-api \
  --s3-bucket finops-saas-deployments \
  --s3-key dev/lambda-function.zip
```

### Step 5.5: Verify Backend
```bash
curl https://<api-gateway-endpoint>/health
# Should return: {"status": "healthy"}
```

---

## 6. Frontend Deployment (S3 + CloudFront)

### Step 6.1: Update Frontend Config
Create `frontend/.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://<api-gateway-endpoint>
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<from terraform>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<from terraform>
NEXT_PUBLIC_COGNITO_REGION=ap-south-1
NEXT_PUBLIC_RAZORPAY_KEY_ID=<from razorpay>
NEXT_PUBLIC_S3_BUCKET_URL=https://<cloudfront-domain>
```

### Step 6.2: Build and Deploy
```bash
cd frontend
npm install
npm run build

# Deploy to S3
aws s3 sync out/ s3://<frontend-bucket-name> --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

### Step 6.3: Verify Frontend
Open `https://<cloudfront-domain>` in your browser.

---

## 7. GitHub Repository Setup

### Step 7.1: Create Repository
```bash
cd finops-saas

git init
git add .
git commit -m "Initial commit: FinOps SaaS Platform

- React/Next.js frontend with full LMS, dashboard, career support
- FastAPI backend with Lambda deployment, tier-based access control
- Terraform infrastructure for complete AWS serverless stack
- GitHub Actions CI/CD pipelines for frontend, backend, and infra"

gh repo create finops-saas --private --source=. --push
```

### Step 7.2: Create Branches
```bash
git checkout -b develop
git push -u origin develop

# Set develop as default branch for PRs
gh repo edit --default-branch develop
```

---

## 8. CI/CD Pipeline Configuration

### Step 8.1: Set GitHub Repository Variables
```bash
# Common
gh variable set AWS_REGION --body "ap-south-1"
gh variable set DEPLOYMENT_BUCKET --body "finops-saas-deployments"

# Dev environment
gh variable set API_URL --body "https://<dev-api-endpoint>" --env development
gh variable set COGNITO_USER_POOL_ID --body "<dev-pool-id>" --env development
gh variable set COGNITO_CLIENT_ID --body "<dev-client-id>" --env development
gh variable set RAZORPAY_KEY_ID --body "<razorpay-test-key>" --env development
gh variable set S3_BUCKET_URL --body "https://<dev-cloudfront>" --env development
gh variable set FRONTEND_BUCKET_DEV --body "<dev-frontend-bucket>" --env development
gh variable set CLOUDFRONT_DIST_DEV --body "<dev-distribution-id>" --env development

# Prod environment
gh variable set API_URL --body "https://<prod-api-endpoint>" --env production
gh variable set COGNITO_USER_POOL_ID --body "<prod-pool-id>" --env production
gh variable set COGNITO_CLIENT_ID --body "<prod-client-id>" --env production
gh variable set RAZORPAY_KEY_ID --body "<razorpay-live-key>" --env production
gh variable set FRONTEND_BUCKET_PROD --body "<prod-frontend-bucket>" --env production
gh variable set CLOUDFRONT_DIST_PROD --body "<prod-distribution-id>" --env production
```

### Step 8.2: Set GitHub Secrets
```bash
gh secret set AWS_DEPLOY_ROLE_ARN --body "arn:aws:iam::YOUR_ACCOUNT:role/github-actions-finops-saas"
```

### Step 8.3: Create GitHub Environments
Go to Repository Settings → Environments:
- Create `development` environment (auto-deploy from `develop`)
- Create `production` environment (require manual approval)

### Step 8.4: Test Pipelines
```bash
# Push to develop to trigger dev deployment
git checkout develop
echo "# trigger" >> README.md
git add README.md
git commit -m "Test CI/CD pipeline"
git push

# Check Actions tab in GitHub
gh run list
```

---

## 9. Post-Deployment Verification

### Checklist
- [ ] Frontend loads at CloudFront URL
- [ ] User signup works (check Cognito console)
- [ ] User login returns JWT token
- [ ] Courses API returns data: `curl <api>/courses`
- [ ] S3 presigned URLs work for video access
- [ ] Razorpay checkout opens correctly
- [ ] Admin panel accessible with admin role
- [ ] Career support pages load for Transformate users
- [ ] Lead capture form submits to DynamoDB
- [ ] Email notifications sent via SES

### Create Admin User
```bash
aws cognito-idp admin-create-user \
  --user-pool-id <pool-id> \
  --username admin@yourdomain.com \
  --user-attributes Name=email,Value=admin@yourdomain.com Name=custom:role,Value=admin \
  --temporary-password "TempPass123!"

aws cognito-idp admin-add-user-to-group \
  --user-pool-id <pool-id> \
  --username admin@yourdomain.com \
  --group-name admin
```

### Create Sample Course
```bash
curl -X POST https://<api>/admin/courses \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FinOps Foundation",
    "description": "Complete FinOps certification preparation course",
    "category": "finops",
    "difficulty": "intermediate"
  }'
```

---

## 10. Troubleshooting

### Lambda not responding
```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/finops-saas-dev-api --follow

# Test Lambda directly
aws lambda invoke --function-name finops-saas-dev-api \
  --payload '{"httpMethod":"GET","path":"/health"}' response.json
cat response.json
```

### CORS errors in browser
- Verify API Gateway CORS settings in Terraform
- Check `ALLOWED_ORIGINS` in Lambda environment variables
- Ensure CloudFront forwards `Origin` header

### Cognito auth failures
```bash
# Check user pool status
aws cognito-idp describe-user-pool --user-pool-id <pool-id>

# List users
aws cognito-idp list-users --user-pool-id <pool-id>
```

### DynamoDB access denied
- Check Lambda execution role has DynamoDB permissions
- Verify table names match environment variables
- Check IAM policy resource ARNs

### Frontend build failures
```bash
# Check environment variables are set
cat frontend/.env.local

# Rebuild with verbose output
cd frontend && npm run build 2>&1 | tee build.log
```
