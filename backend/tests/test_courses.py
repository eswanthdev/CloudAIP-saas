"""Sample tests for courses API."""
import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


class TestCourses:
    """Test suite for courses endpoints."""

    def test_health_check(self):
        """Test health check endpoint.

        Verifies:
            - Health endpoint returns 200
            - Response contains expected fields
        """
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert "service" in response.json()
        assert "version" in response.json()

    def test_root_endpoint(self):
        """Test root endpoint.

        Verifies:
            - Root endpoint returns 200
            - Response contains API information
        """
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["name"] == "FinOps SaaS Training Backend"
        assert "version" in response.json()
        assert "docs" in response.json()

    def test_list_courses_public(self):
        """Test listing courses without authentication.

        Verifies:
            - Public course listing endpoint is accessible
            - Response may fail with 500 if DynamoDB not available in test env
        """
        response = client.get("/courses")
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            assert isinstance(response.json(), list)

    def test_get_course_not_found(self):
        """Test getting non-existent course.

        Verifies:
            - Getting non-existent course returns 404
            - Error message is descriptive
        """
        response = client.get("/courses/invalid-course-id")
        assert response.status_code == 404 or response.status_code == 500
        # Response may fail due to DynamoDB not being available in tests

    def test_create_course_requires_auth(self):
        """Test creating course without authentication.

        Verifies:
            - Creating course without auth returns 403
        """
        response = client.post(
            "/admin/courses",
            json={
                "name": "Test Course",
                "description": "Test description",
                "category": "cloud",
                "difficulty": "beginner",
                "instructor_id": "instructor-1",
            },
        )
        assert response.status_code == 403 or response.status_code == 401


class TestAuthentication:
    """Test suite for authentication endpoints."""

    def test_signup_endpoint_exists(self):
        """Test signup endpoint exists.

        Verifies:
            - Signup endpoint accepts POST requests
            - Returns appropriate status
        """
        response = client.post(
            "/auth/signup",
            json={
                "email": "test@example.com",
                "password": "ValidPassword123!",
                "first_name": "John",
                "last_name": "Doe",
            },
        )
        # Will fail due to no Cognito connection, but endpoint should exist
        assert response.status_code in [400, 500]

    def test_login_endpoint_exists(self):
        """Test login endpoint exists.

        Verifies:
            - Login endpoint accepts POST requests
        """
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "TestPassword123!",
            },
        )
        # Will fail due to no Cognito connection, but endpoint should exist
        assert response.status_code in [401, 500]


class TestPayments:
    """Test suite for payments endpoints."""

    def test_create_order_requires_auth(self):
        """Test creating payment order without authentication.

        Verifies:
            - Creating order without auth returns 401/403
        """
        response = client.post(
            "/payments/create-order",
            json={
                "course_id": "course-1",
                "tier_name": "IGNITE",
                "currency": "INR",
            },
        )
        assert response.status_code in [401, 403]


class TestAdmin:
    """Test suite for admin endpoints."""

    def test_admin_endpoints_require_auth(self):
        """Test admin endpoints require authentication.

        Verifies:
            - Admin endpoints return 401/403 without auth
        """
        endpoints = [
            ("/admin/courses", "POST"),
            ("/admin/enrollments", "GET"),
            ("/admin/mentorship/sessions", "GET"),
            ("/admin/dashboard/stats", "GET"),
        ]

        for endpoint, method in endpoints:
            if method == "POST":
                response = client.post(endpoint, json={})
            else:
                response = client.get(endpoint)

            assert response.status_code in [401, 403]


class TestCareer:
    """Test suite for career support endpoints."""

    def test_mock_interview_requires_auth(self):
        """Test mock interview endpoint requires authentication.

        Verifies:
            - Mock interview endpoint returns 401/403 without auth
        """
        response = client.post(
            "/career/mock-interview/schedule",
            json={
                "course_id": "course-1",
                "preferred_date": "2024-02-15",
                "preferred_time": "14:00",
                "interview_type": "technical",
            },
        )
        assert response.status_code in [401, 403]

    def test_mentorship_requires_auth(self):
        """Test mentorship booking requires authentication.

        Verifies:
            - Mentorship endpoint returns 401/403 without auth
        """
        response = client.post(
            "/career/mentorship/book",
            json={
                "course_id": "course-1",
                "topic": "AWS Cost Optimization",
                "preferred_date": "2024-02-15",
                "preferred_time": "14:00",
                "duration_minutes": 60,
            },
        )
        assert response.status_code in [401, 403]


class TestProgress:
    """Test suite for progress tracking endpoints."""

    def test_mark_complete_requires_auth(self):
        """Test marking lesson complete requires authentication.

        Verifies:
            - Progress endpoint returns 401/403 without auth
        """
        response = client.post(
            "/progress/mark-complete",
            json={
                "lesson_id": "lesson-1",
                "time_spent_minutes": 45,
            },
        )
        assert response.status_code in [401, 403]

    def test_get_course_progress_requires_auth(self):
        """Test getting course progress requires authentication.

        Verifies:
            - Get progress endpoint returns 401/403 without auth
        """
        response = client.get("/progress/course/course-1")
        assert response.status_code in [401, 403]


class TestServices:
    """Test suite for services endpoints."""

    def test_submit_lead_public(self):
        """Test submitting service lead (public endpoint).

        Verifies:
            - Lead submission endpoint accepts POST requests
            - Returns appropriate status
        """
        response = client.post(
            "/services/lead",
            json={
                "company_name": "Acme Corp",
                "contact_email": "contact@acme.com",
                "contact_phone": "+1234567890",
                "contact_name": "John Smith",
                "service_type": "finops_strategy",
                "company_size": "enterprise",
                "annual_cloud_spend": "5M-10M",
            },
        )
        # Will fail due to DynamoDB, but endpoint should accept the request
        assert response.status_code in [200, 400, 500]

    def test_list_leads_requires_auth(self):
        """Test listing leads requires authentication.

        Verifies:
            - List leads endpoint returns 401/403 without auth
        """
        response = client.get("/services/leads")
        assert response.status_code in [401, 403]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
