@echo off
echo ============================================
echo  CloudAIP SaaS - CI/CD Setup Script
echo ============================================
echo.

echo Step 1: Creating S3 bucket for Terraform state...
aws s3 mb s3://cloudaip-saas-terraform-state --region ap-south-1
if %errorlevel% neq 0 (
    echo WARNING: Bucket may already exist, continuing...
)

echo.
echo Step 2: Enabling versioning on state bucket...
aws s3api put-bucket-versioning --bucket cloudaip-saas-terraform-state --versioning-configuration Status=Enabled --region ap-south-1

echo.
echo Step 3: Creating DynamoDB lock table...
aws dynamodb create-table --table-name cloudaip-terraform-locks --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST --region ap-south-1
if %errorlevel% neq 0 (
    echo WARNING: Table may already exist, continuing...
)

echo.
echo Step 4: Verifying resources...
aws s3api head-bucket --bucket cloudaip-saas-terraform-state --region ap-south-1
if %errorlevel% equ 0 (
    echo    S3 bucket: OK
) else (
    echo    S3 bucket: FAILED
)

aws dynamodb describe-table --table-name cloudaip-terraform-locks --region ap-south-1 --query "Table.TableStatus" --output text
if %errorlevel% equ 0 (
    echo    DynamoDB table: OK
) else (
    echo    DynamoDB table: FAILED
)

echo.
echo ============================================
echo  AWS Resources Created Successfully!
echo ============================================
echo.
echo NEXT STEPS:
echo   1. Go to: https://github.com/eswanthdev/CloudAIP-saas/settings/secrets/actions
echo   2. Add secret: AWS_ACCESS_KEY_ID
echo   3. Add secret: AWS_SECRET_ACCESS_KEY
echo   4. Go to: https://github.com/eswanthdev/CloudAIP-saas/settings/environments
echo   5. Create environment: development
echo   6. Create environment: production
echo   7. Then commit and push the updated files
echo.
pause
