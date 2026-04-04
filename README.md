# FinOps SaaS Platform

A full-stack serverless SaaS platform for FinOps training, career support, and consulting services. Built with React/Next.js, FastAPI, AWS serverless infrastructure, and managed entirely via Terraform.

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js    │────▶│  CloudFront  │────▶│   S3 Static │
│   Frontend   │     │     CDN      │     │   Hosting   │
└─────────────┘     └──────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ API Gateway  │────▶│    Lambda    │────▶│  DynamoDB   │
│  (HTTP API)  │     │  (FastAPI)   │     │  (9 Tables) │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Cognito    │     │   S3 Media   │     │ EventBridge │
│  User Pool   │     │   Buckets    │     │   + SNS/SQS │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | Next.js 14, TypeScript, Tailwind CSS|
| Backend        | Python FastAPI + Mangum (Lambda)    |
| Database       | AWS DynamoDB (serverless)           |
| Authentication | AWS Cognito (JWT-based)             |
| Storage        | AWS S3 + CloudFront CDN             |
| Payments       | Razorpay                            |
| Infrastructure | Terraform (modular)                 |
| CI/CD          | GitHub Actions (3 pipelines)        |

## Project Structure

```
finops-saas/
├── frontend/                 # Next.js 14 React application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # API client, auth helpers
│   │   ├── hooks/           # Custom React hooks
│   │   └── store/           # Context providers
│   └── package.json
│
├── backend/                  # FastAPI Lambda backend
│   ├── app/
│   │   ├── api/routes/      # API endpoints
│   │   ├── api/middleware/   # Auth middleware
│   │   ├── models/          # DynamoDB models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic services
│   │   └── utils/           # Utilities
│   ├── tests/
│   └── requirements.txt
│
├── infrastructure/           # Terraform IaC
│   ├── modules/
│   │   ├── dynamodb/        # 9 DynamoDB tables
│   │   ├── cognito/         # User pool + groups
│   │   ├── s3/              # 3 S3 buckets
│   │   ├── lambda/          # Lambda function + layer
│   │   ├── api_gateway/     # HTTP API v2
│   │   ├── cloudfront/      # CDN distribution
│   │   ├── eventbridge/     # Scheduled events
│   │   ├── sns_sqs/         # Notifications + queues
│   │   ├── ses/             # Email service
│   │   └── iam/             # Roles + policies
│   └── environments/
│       ├── dev/
│       └── prod/
│
├── .github/workflows/        # CI/CD pipelines
│   ├── frontend-ci-cd.yml
│   ├── backend-ci-cd.yml
│   └── infra-ci-cd.yml
│
└── docs/                     # Documentation
```

## Course Tier System

The platform supports two tiers per course:

### IGNITE Tier
- Course video access
- Lab sessions (guided hands-on)
- Basic support

### TRANSFORMATE Tier (includes all of Ignite)
- Mock interviews
- Placement support
- Resume review
- 1:1 mentorship sessions
- Priority support

## Feature Modules

1. **Authentication** - Cognito-based signup/login with role-based access (student, admin, client)
2. **LMS** - Course → Modules → Lessons with video, lab, mock interview, and placement session types
3. **Student Dashboard** - Enrolled courses, progress tracking, tier badges, upcoming sessions
4. **Career Support** - Mock interview scheduling, resume upload, placement tracking, mentor booking (Transformate only)
5. **Services** - FinOps consulting and cloud optimization with lead capture
6. **Admin Panel** - Course management, video upload, mentor assignment, lead management
7. **Payments** - Razorpay integration for tier-based course pricing

## Deployment Guide

### Prerequisites
- AWS CLI configured with appropriate credentials
- Terraform >= 1.6.0
- Node.js >= 18
- Python >= 3.11
- GitHub repository with Actions enabled

### Step 1: Infrastructure Setup

```bash
# Create Terraform state bucket (one-time)
aws s3 mb s3://finops-saas-terraform-state --region ap-south-1

# Deploy dev environment
cd infrastructure/environments/dev
terraform init
terraform plan
terraform apply
```

### Step 2: Backend Deployment

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn app.main:app --reload

# Package for Lambda
bash deploy.sh
```

### Step 3: Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local with your values
cp .env.example .env.local

# Run locally
npm run dev

# Build for production
npm run build
```

### Step 4: CI/CD Setup

Configure these GitHub repository variables and secrets:

**Repository Variables:**
- `AWS_REGION` - AWS region (e.g., ap-south-1)
- `API_URL` - API Gateway URL
- `COGNITO_USER_POOL_ID` - Cognito pool ID
- `COGNITO_CLIENT_ID` - Cognito client ID
- `RAZORPAY_KEY_ID` - Razorpay public key
- `FRONTEND_BUCKET_DEV` / `FRONTEND_BUCKET_PROD` - S3 bucket names
- `CLOUDFRONT_DIST_DEV` / `CLOUDFRONT_DIST_PROD` - CloudFront distribution IDs
- `DEPLOYMENT_BUCKET` - S3 bucket for Lambda packages

**Repository Secrets:**
- `AWS_DEPLOY_ROLE_ARN` - IAM role ARN for GitHub Actions OIDC

### Pipeline Flow

```
develop branch → Dev environment
main branch    → Production environment

Frontend:  Lint → Test → Build → Deploy to S3 → Invalidate CloudFront
Backend:   Lint → Test → Package → Deploy Lambda
Infra:     Validate → Security Scan → Plan → Apply
```

## DynamoDB Tables

| Table              | PK       | SK        | GSIs                    |
|--------------------|----------|-----------|-------------------------|
| Users              | id       | -         | email-index             |
| Courses            | id       | -         | -                       |
| CourseTiers        | id       | -         | course_id-index         |
| Enrollments        | id       | -         | user_id-index, course_id-index |
| Modules            | id       | -         | course_id-index         |
| Lessons            | id       | -         | module_id-index         |
| Progress           | user_id  | lesson_id | -                       |
| ServiceLeads       | id       | -         | status-index            |
| MentorshipSessions | id       | -         | user_id-index, mentor_id-index |

## API Endpoints Summary

| Method | Endpoint                        | Auth     | Description              |
|--------|---------------------------------|----------|--------------------------|
| POST   | /auth/signup                    | Public   | Register new user        |
| POST   | /auth/login                     | Public   | Authenticate user        |
| GET    | /courses                        | Public   | List courses             |
| GET    | /courses/{id}                   | Public   | Course details           |
| POST   | /courses/enroll                 | Student  | Enroll in course+tier    |
| GET    | /lessons/{id}/content           | Student  | Get lesson (tier-gated)  |
| POST   | /career/mock-interview/schedule | Student* | Schedule interview       |
| POST   | /career/resume/upload           | Student* | Upload resume            |
| POST   | /services/lead                  | Public   | Submit consulting lead   |
| POST   | /admin/courses                  | Admin    | Create course            |
| POST   | /payments/create-order          | Student  | Create Razorpay order    |

*Transformate tier only

## Environment Variables

See `.env.example` files in frontend/ and backend/ directories for the complete list of required environment variables.

## License

Proprietary - All rights reserved.
