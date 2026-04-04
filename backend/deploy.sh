#!/bin/bash
# Lambda deployment script for FinOps SaaS Backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
LAMBDA_FUNCTION_NAME="${LAMBDA_FUNCTION_NAME:-finops-saas-backend}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
LAMBDA_ROLE_ARN="${LAMBDA_ROLE_ARN}"
LAMBDA_TIMEOUT="${LAMBDA_TIMEOUT:-60}"
LAMBDA_MEMORY="${LAMBDA_MEMORY:-512}"

# Build directory
BUILD_DIR="build"
ZIP_FILE="lambda_deployment.zip"

echo -e "${YELLOW}=== FinOps SaaS Backend Lambda Deployment ===${NC}\n"

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}\n"

# Create build directory
echo "Creating build directory..."
rm -rf "$BUILD_DIR" "$ZIP_FILE"
mkdir -p "$BUILD_DIR"

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt -t "$BUILD_DIR" --quiet

# Copy application code
echo "Copying application code..."
cp -r app "$BUILD_DIR/"

# Create zip file
echo "Creating deployment package..."
cd "$BUILD_DIR"
zip -r "../$ZIP_FILE" . > /dev/null 2>&1
cd ..

ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
echo -e "${GREEN}✓ Deployment package created (${ZIP_SIZE})${NC}\n"

# Check if function exists
echo "Checking Lambda function..."
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION" 2>/dev/null; then
    echo "Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --zip-file "fileb://$ZIP_FILE" \
        --region "$AWS_REGION" \
        --query 'FunctionArn' \
        --output text

    echo "Updating function configuration..."
    aws lambda update-function-configuration \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --runtime python3.11 \
        --handler app.main:handler \
        --timeout "$LAMBDA_TIMEOUT" \
        --memory-size "$LAMBDA_MEMORY" \
        --region "$AWS_REGION" \
        --query 'FunctionArn' \
        --output text
else
    echo "Creating new Lambda function..."

    if [ -z "$LAMBDA_ROLE_ARN" ]; then
        echo -e "${RED}LAMBDA_ROLE_ARN not set. Please provide the IAM role ARN.${NC}"
        echo "Example: export LAMBDA_ROLE_ARN='arn:aws:iam::123456789:role/lambda-role'"
        exit 1
    fi

    aws lambda create-function \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --runtime python3.11 \
        --role "$LAMBDA_ROLE_ARN" \
        --handler app.main:handler \
        --zip-file "fileb://$ZIP_FILE" \
        --timeout "$LAMBDA_TIMEOUT" \
        --memory-size "$LAMBDA_MEMORY" \
        --region "$AWS_REGION" \
        --query 'FunctionArn' \
        --output text
fi

echo -e "${GREEN}✓ Lambda function deployed successfully${NC}\n"

# Create API Gateway integration (optional)
if [ "$CREATE_API_GATEWAY" = "true" ]; then
    echo "Setting up API Gateway..."

    REST_API_ID=$(aws apigateway create-rest-api \
        --name "finops-saas-api" \
        --description "FinOps SaaS Training Platform API" \
        --region "$AWS_REGION" \
        --query 'id' \
        --output text 2>/dev/null || echo "")

    if [ -z "$REST_API_ID" ]; then
        echo -e "${YELLOW}API Gateway setup skipped (may already exist)${NC}"
    else
        echo -e "${GREEN}✓ API Gateway created: $REST_API_ID${NC}"
    fi
fi

# Environment variables template
echo "Creating environment variables template..."
cat > .env.example << EOF
# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# DynamoDB Configuration
DYNAMODB_COURSES_TABLE=courses
DYNAMODB_ENROLLMENTS_TABLE=enrollments
DYNAMODB_USERS_TABLE=users
DYNAMODB_PROGRESS_TABLE=progress
DYNAMODB_PAYMENTS_TABLE=payments
DYNAMODB_MENTORSHIP_TABLE=mentorship_sessions
DYNAMODB_LEADS_TABLE=service_leads

# Cognito Configuration
COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
COGNITO_CLIENT_ID=your-client-id
COGNITO_REGION=ap-south-1

# S3 Configuration
S3_BUCKET_VIDEOS=finops-videos
S3_BUCKET_RESUMES=finops-resumes
S3_BUCKET_CERTIFICATES=finops-certificates
S3_REGION=ap-south-1

# Razorpay Configuration
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# SES Configuration
SES_SENDER_EMAIL=noreply@finops-training.com

# Application Configuration
ENVIRONMENT=production
JWT_SECRET_KEY=your-jwt-secret-key
EOF

echo -e "${GREEN}✓ Environment template created (.env.example)${NC}\n"

# Cleanup
echo "Cleaning up..."
rm -rf "$BUILD_DIR"

echo -e "${GREEN}=== Deployment Complete ===${NC}\n"
echo "Function Name: $LAMBDA_FUNCTION_NAME"
echo "Region: $AWS_REGION"
echo "Memory: ${LAMBDA_MEMORY}MB"
echo "Timeout: ${LAMBDA_TIMEOUT}s"
echo ""
echo "Next steps:"
echo "1. Update environment variables in Lambda console or use AWS CLI"
echo "2. Set up API Gateway trigger"
echo "3. Configure DynamoDB tables"
echo "4. Set up S3 buckets for media storage"
echo "5. Configure Cognito user pool"
echo ""
echo "To set environment variables:"
echo "aws lambda update-function-configuration \\"
echo "  --function-name $LAMBDA_FUNCTION_NAME \\"
echo "  --environment Variables='{ENVIRONMENT=production,AWS_REGION=ap-south-1}' \\"
echo "  --region $AWS_REGION"
