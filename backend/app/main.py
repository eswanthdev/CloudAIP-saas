"""FastAPI main application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.config import settings
from app.api.routes import (
    auth,
    courses,
    lessons,
    career,
    services,
    admin,
    payments,
    progress,
)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="FinOps SaaS Training Platform Backend API",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint.

    Returns:
        dict: Health status.
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint.

    Returns:
        dict: API information.
    """
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


# Include routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(career.router)
app.include_router(services.router)
app.include_router(admin.router)
app.include_router(payments.router)
app.include_router(progress.router)


# Lambda handler for AWS Lambda deployment
handler = Mangum(app, lifespan="off")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
