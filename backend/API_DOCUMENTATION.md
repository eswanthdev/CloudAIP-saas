# FinOps SaaS Training Platform - API Documentation

## Overview

The FinOps SaaS Backend is a production-ready FastAPI application deployed on AWS Lambda. It provides comprehensive APIs for managing online courses, student enrollments, payments, and career support.

## Architecture

- **Framework**: FastAPI with Mangum for Lambda
- **Database**: DynamoDB for all data storage
- **Authentication**: AWS Cognito with JWT tokens
- **Payments**: Razorpay integration
- **File Storage**: S3 buckets for videos, resumes, and certificates
- **Notifications**: AWS SES for email

## Base URL

```
http://localhost:8000  (development)
https://api.finops-training.com  (production)
```

## Authentication

All protected endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are obtained from the `/auth/login` endpoint.

---

## API Endpoints

### Authentication Endpoints

#### POST /auth/signup
Register a new user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+911234567890"
}
```

**Response** (201):
```json
{
  "user_id": "cognito-user-id",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "message": "Signup successful. You can now login."
}
```

#### POST /auth/login
Authenticate user and get JWT tokens.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200):
```json
{
  "user_id": "cognito-user-id",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### POST /auth/refresh
Refresh the access token.

**Request Body**:
```json
{
  "refresh_token": "refresh-token-value"
}
```

**Response** (200):
```json
{
  "access_token": "new-access-token",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### GET /auth/me
Get current user profile. Requires authentication.

**Response** (200):
```json
{
  "user_id": "user-id",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+911234567890",
  "created_at": "2024-01-15T10:30:00+00:00",
  "updated_at": "2024-01-15T10:30:00+00:00"
}
```

---

### Course Endpoints

#### GET /courses
List all active courses (public endpoint).

**Query Parameters**:
- `category` (optional): Filter by category
- `difficulty` (optional): Filter by difficulty level

**Response** (200):
```json
[
  {
    "course_id": "course-123",
    "name": "AWS Cost Optimization Fundamentals",
    "description": "Learn to optimize AWS costs...",
    "category": "cloud",
    "difficulty": "beginner",
    "instructor_id": "instructor-1",
    "status": "active",
    "created_at": "2024-01-15T10:30:00+00:00"
  }
]
```

#### GET /courses/{course_id}
Get course details with tiers and modules.

**Response** (200):
```json
{
  "course_id": "course-123",
  "name": "AWS Cost Optimization",
  "description": "Complete FinOps training...",
  "category": "cloud",
  "difficulty": "beginner",
  "instructor_id": "instructor-1",
  "tiers": [
    {
      "tier_name": "IGNITE",
      "price_usd": 99.99,
      "price_inr": 8299.0,
      "features": {
        "lesson_types": ["video", "lab"],
        "mock_interviews": 0,
        "mentorship_hours": 0,
        "placement_support": false,
        "resume_review": false
      }
    },
    {
      "tier_name": "TRANSFORMATE",
      "price_usd": 299.99,
      "price_inr": 24999.0,
      "features": {
        "lesson_types": ["video", "lab", "mock_interview", "placement_session"],
        "mock_interviews": 4,
        "mentorship_hours": 10,
        "placement_support": true,
        "resume_review": true
      }
    }
  ],
  "modules": [],
  "created_at": "2024-01-15T10:30:00+00:00",
  "updated_at": "2024-01-15T10:30:00+00:00",
  "status": "active"
}
```

#### POST /courses/enroll
Enroll user in a course. Requires authentication.

**Request Body**:
```json
{
  "course_id": "course-123",
  "tier_name": "IGNITE"
}
```

**Response** (201):
```json
{
  "enrollment_id": "enrollment-456",
  "user_id": "user-789",
  "course_id": "course-123",
  "tier_name": "IGNITE",
  "status": "active",
  "enrolled_at": "2024-01-15T10:30:00+00:00",
  "updated_at": "2024-01-15T10:30:00+00:00"
}
```

#### GET /courses/my-courses
Get user's enrolled courses with progress. Requires authentication.

**Response** (200):
```json
[
  {
    "enrollment_id": "enrollment-456",
    "course_id": "course-123",
    "course_name": "AWS Cost Optimization",
    "tier_name": "IGNITE",
    "status": "active",
    "enrolled_at": "2024-01-15T10:30:00+00:00",
    "progress_percentage": 45
  }
]
```

---

### Lesson Endpoints

#### GET /lessons/{module_id}
Get lessons for a module. Requires enrollment verification.

**Query Parameters**:
- `course_id`: Course ID (required)

**Response** (200):
```json
[
  {
    "lesson_id": "lesson-1",
    "lesson_name": "Introduction to FinOps",
    "description": "Basic concepts...",
    "lesson_type": "video",
    "content_url": "s3://bucket/path",
    "duration_minutes": 45,
    "order": 1,
    "created_at": "2024-01-15T10:30:00+00:00"
  }
]
```

#### GET /lessons/{lesson_id}/content
Get lesson content with presigned URL. Requires tier verification.

**Query Parameters**:
- `course_id`: Course ID (required)

**Response** (200):
```json
{
  "lesson_id": "lesson-1",
  "lesson_name": "Introduction to FinOps",
  "lesson_type": "video",
  "content_url": "https://presigned-s3-url-valid-for-1-hour",
  "duration_minutes": 45
}
```

---

### Payment Endpoints

#### POST /payments/create-order
Create a Razorpay order for enrollment. Requires authentication.

**Request Body**:
```json
{
  "course_id": "course-123",
  "tier_name": "TRANSFORMATE",
  "currency": "INR"
}
```

**Response** (201):
```json
{
  "order_id": "order-789",
  "razorpay_order_id": "order_12345678",
  "amount": 24999.0,
  "currency": "INR",
  "course_id": "course-123",
  "tier_name": "TRANSFORMATE",
  "status": "pending"
}
```

#### POST /payments/verify
Verify Razorpay payment and create enrollment. Requires authentication.

**Request Body**:
```json
{
  "order_id": "order-789",
  "payment_id": "pay_12345678",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response** (200):
```json
{
  "payment_id": "pay_12345678",
  "order_id": "order-789",
  "amount": 24999.0,
  "currency": "INR",
  "status": "verified",
  "verified_at": "2024-01-15T10:35:00+00:00"
}
```

#### GET /payments/history
Get payment history. Requires authentication.

**Response** (200):
```json
{
  "payments": [
    {
      "payment_id": "pay_12345678",
      "order_id": "order-789",
      "course_id": "course-123",
      "course_name": "AWS Cost Optimization",
      "tier_name": "TRANSFORMATE",
      "amount": 24999.0,
      "currency": "INR",
      "status": "verified",
      "paid_at": "2024-01-15T10:35:00+00:00"
    }
  ],
  "total_count": 1,
  "total_amount_inr": 24999.0,
  "total_amount_usd": 0.0
}
```

---

### Career Support Endpoints

#### POST /career/mock-interview/schedule
Schedule a mock interview (TRANSFORMATE tier only). Requires authentication.

**Request Body**:
```json
{
  "course_id": "course-123",
  "preferred_date": "2024-02-15",
  "preferred_time": "14:00",
  "interview_type": "technical",
  "topic": "AWS Architecture"
}
```

**Response** (201):
```json
{
  "session_id": "session-123",
  "user_id": "user-789",
  "course_id": "course-123",
  "scheduled_at": "2024-02-15T14:00:00",
  "status": "scheduled",
  "interview_type": "technical",
  "topic": "AWS Architecture",
  "created_at": "2024-01-15T10:30:00+00:00"
}
```

#### POST /career/resume/upload
Upload resume to S3 (TRANSFORMATE tier only). Requires authentication.

**Method**: Form Data
- `course_id`: Course ID (string, required)
- `file`: Resume file (PDF or DOC)

**Response** (201):
```json
{
  "resume_id": "resume-456",
  "user_id": "user-789",
  "course_id": "course-123",
  "file_name": "JohnDoe_Resume.pdf",
  "file_size": 245000,
  "uploaded_at": "2024-01-15T10:30:00+00:00",
  "reviewed": false
}
```

#### GET /career/placement/status
Get placement tracking status (TRANSFORMATE tier only). Requires authentication.

**Query Parameters**:
- `course_id`: Course ID (required)

**Response** (200):
```json
{
  "user_id": "user-789",
  "course_id": "course-123",
  "status": "in_progress",
  "applications_count": 5,
  "interviews_scheduled": 2,
  "offers_received": 0,
  "last_updated": "2024-01-15T10:30:00+00:00"
}
```

#### POST /career/mentorship/book
Book a mentorship session (TRANSFORMATE tier only). Requires authentication.

**Request Body**:
```json
{
  "course_id": "course-123",
  "topic": "AWS Cost Optimization Strategy",
  "preferred_date": "2024-02-15",
  "preferred_time": "14:00",
  "duration_minutes": 60
}
```

**Response** (201):
```json
{
  "session_id": "mentorship-789",
  "user_id": "user-789",
  "mentor_id": null,
  "course_id": "course-123",
  "topic": "AWS Cost Optimization Strategy",
  "scheduled_at": "2024-02-15T14:00:00",
  "duration_minutes": 60,
  "status": "booked",
  "created_at": "2024-01-15T10:30:00+00:00"
}
```

#### GET /career/mentorship/sessions
Get user's mentorship sessions. Requires authentication.

**Response** (200):
```json
[
  {
    "session_id": "mentorship-789",
    "user_id": "user-789",
    "mentor_id": "mentor-123",
    "course_id": "course-123",
    "topic": "AWS Cost Optimization Strategy",
    "scheduled_at": "2024-02-15T14:00:00",
    "duration_minutes": 60,
    "status": "assigned",
    "meeting_link": "https://zoom.us/meeting/...",
    "feedback": null,
    "created_at": "2024-01-15T10:30:00+00:00"
  }
]
```

---

### Progress Endpoints

#### POST /progress/mark-complete
Mark lesson as complete. Requires authentication.

**Request Body**:
```json
{
  "lesson_id": "lesson-1",
  "time_spent_minutes": 45
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user_id": "user-789",
    "lesson_id": "lesson-1",
    "completed_at": "2024-01-15T10:35:00+00:00",
    "time_spent_minutes": 45,
    "status": "completed"
  }
}
```

#### GET /progress/course/{course_id}
Get course progress. Requires authentication.

**Response** (200):
```json
{
  "course_id": "course-123",
  "course_name": "AWS Cost Optimization",
  "total_lessons": 20,
  "completed_lessons": 9,
  "progress_percentage": 45,
  "enrollment_tier": "IGNITE",
  "total_time_spent_minutes": 480,
  "last_accessed": "2024-01-15T10:35:00+00:00"
}
```

#### POST /progress/certificate/{course_id}
Generate certificate after 100% completion. Requires authentication.

**Response** (201):
```json
{
  "certificate_id": "cert-456",
  "user_id": "user-789",
  "course_id": "course-123",
  "course_name": "AWS Cost Optimization",
  "issued_date": "2024-01-15T10:40:00+00:00",
  "certificate_url": "s3://bucket/certificates/cert-456.pdf",
  "pdf_url": "https://presigned-url-for-download"
}
```

---

### Service Leads Endpoints

#### POST /services/lead
Submit consulting service lead (public endpoint).

**Request Body**:
```json
{
  "company_name": "Acme Corp",
  "contact_email": "contact@acme.com",
  "contact_phone": "+1234567890",
  "contact_name": "John Smith",
  "service_type": "finops_strategy",
  "company_size": "enterprise",
  "annual_cloud_spend": "5M-10M",
  "description": "Looking for FinOps consulting"
}
```

**Response** (201):
```json
{
  "lead_id": "lead-123",
  "company_name": "Acme Corp",
  "contact_email": "contact@acme.com",
  "contact_phone": "+1234567890",
  "contact_name": "John Smith",
  "service_type": "finops_strategy",
  "company_size": "enterprise",
  "annual_cloud_spend": "5M-10M",
  "status": "new",
  "created_at": "2024-01-15T10:30:00+00:00",
  "updated_at": "2024-01-15T10:30:00+00:00"
}
```

#### GET /services/leads
List all service leads (admin only). Requires authentication with admin role.

**Response** (200):
```json
[
  {
    "lead_id": "lead-123",
    "company_name": "Acme Corp",
    "contact_name": "John Smith",
    "contact_email": "contact@acme.com",
    "service_type": "finops_strategy",
    "company_size": "enterprise",
    "status": "new",
    "created_at": "2024-01-15T10:30:00+00:00",
    "assigned_to": null
  }
]
```

#### PUT /services/leads/{lead_id}/status
Update lead status (admin only). Requires authentication with admin role.

**Request Body**:
```json
{
  "status": "contacted",
  "notes": "Initial contact made",
  "assigned_to": "sales-person-1"
}
```

**Response** (200):
```json
{
  "lead_id": "lead-123",
  "company_name": "Acme Corp",
  "contact_email": "contact@acme.com",
  "contact_phone": "+1234567890",
  "contact_name": "John Smith",
  "service_type": "finops_strategy",
  "company_size": "enterprise",
  "annual_cloud_spend": "5M-10M",
  "status": "contacted",
  "created_at": "2024-01-15T10:30:00+00:00",
  "updated_at": "2024-01-15T10:40:00+00:00"
}
```

---

### Admin Endpoints

#### POST /admin/courses
Create a new course (admin only). Requires authentication with admin role.

**Request Body**:
```json
{
  "name": "Advanced Kubernetes",
  "description": "Master Kubernetes deployment...",
  "category": "kubernetes",
  "difficulty": "advanced",
  "instructor_id": "instructor-1"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "course_id": "course-789",
    "name": "Advanced Kubernetes",
    "description": "Master Kubernetes...",
    "category": "kubernetes",
    "difficulty": "advanced",
    "instructor_id": "instructor-1",
    "created_at": "2024-01-15T10:30:00+00:00",
    "updated_at": "2024-01-15T10:30:00+00:00",
    "status": "active"
  }
}
```

#### GET /admin/enrollments
List all enrollments (admin only). Requires authentication with admin role.

**Response** (200):
```json
{
  "success": true,
  "data": [...],
  "total": 150
}
```

#### GET /admin/dashboard/stats
Get dashboard statistics (admin only). Requires authentication with admin role.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_courses": 12,
    "total_enrollments": 250,
    "enrollments_by_tier": {
      "IGNITE": 180,
      "TRANSFORMATE": 70
    },
    "total_revenue": 38499.30
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "status_code": 400,
  "message": "Description of the error",
  "error_code": "ERROR_CODE",
  "details": {}
}
```

### Common Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

To be implemented: API rate limiting (10 requests/second per IP)

---

## Webhooks

Razorpay payment events are handled via webhooks:
- `payment.authorized`: Payment captured
- `payment.failed`: Payment failed
- `order.paid`: Order payment completed

---

## Deployment

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set up .env file
cp .env.example .env

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker

```bash
# Start all services
docker-compose up

# Access API at http://localhost:8000
```

### AWS Lambda

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy to Lambda
export LAMBDA_ROLE_ARN=arn:aws:iam::123456789:role/lambda-role
./deploy.sh
```

---

## Support

For API support and issues, please contact: support@finops-training.com
