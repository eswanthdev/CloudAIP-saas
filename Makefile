# FinOps SaaS Platform - Makefile
# Common commands for development and deployment

.PHONY: help frontend-install frontend-dev frontend-build frontend-lint \
        backend-install backend-dev backend-test backend-lint backend-package \
        infra-init-dev infra-plan-dev infra-apply-dev \
        infra-init-prod infra-plan-prod infra-apply-prod \
        docker-up docker-down clean

# ==================== HELP ====================
help:
	@echo "FinOps SaaS Platform - Available Commands"
	@echo "=========================================="
	@echo ""
	@echo "Frontend:"
	@echo "  make frontend-install    Install frontend dependencies"
	@echo "  make frontend-dev        Start frontend dev server"
	@echo "  make frontend-build      Build frontend for production"
	@echo "  make frontend-lint       Run frontend linting"
	@echo ""
	@echo "Backend:"
	@echo "  make backend-install     Install backend dependencies"
	@echo "  make backend-dev         Start backend dev server"
	@echo "  make backend-test        Run backend tests"
	@echo "  make backend-lint        Run backend linting"
	@echo "  make backend-package     Package backend for Lambda"
	@echo ""
	@echo "Infrastructure:"
	@echo "  make infra-init-dev      Initialize Terraform for dev"
	@echo "  make infra-plan-dev      Plan Terraform changes for dev"
	@echo "  make infra-apply-dev     Apply Terraform changes for dev"
	@echo "  make infra-init-prod     Initialize Terraform for prod"
	@echo "  make infra-plan-prod     Plan Terraform changes for prod"
	@echo "  make infra-apply-prod    Apply Terraform changes for prod"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up           Start local development stack"
	@echo "  make docker-down         Stop local development stack"
	@echo ""
	@echo "Utility:"
	@echo "  make clean               Clean build artifacts"
	@echo "  make setup               First-time project setup"

# ==================== FRONTEND ====================
frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-lint:
	cd frontend && npm run lint

# ==================== BACKEND ====================
backend-install:
	cd backend && pip install -r requirements.txt

backend-dev:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

backend-test:
	cd backend && pytest tests/ -v --cov=app

backend-lint:
	cd backend && flake8 app/ --max-line-length=120 && black --check app/

backend-package:
	cd backend && bash deploy.sh

# ==================== INFRASTRUCTURE ====================
infra-init-dev:
	cd infrastructure/environments/dev && terraform init

infra-plan-dev:
	cd infrastructure/environments/dev && terraform plan

infra-apply-dev:
	cd infrastructure/environments/dev && terraform apply

infra-init-prod:
	cd infrastructure/environments/prod && terraform init

infra-plan-prod:
	cd infrastructure/environments/prod && terraform plan

infra-apply-prod:
	cd infrastructure/environments/prod && terraform apply

# ==================== DOCKER ====================
docker-up:
	cd backend && docker-compose up -d

docker-down:
	cd backend && docker-compose down

# ==================== UTILITY ====================
clean:
	rm -rf frontend/.next frontend/out frontend/node_modules
	rm -rf backend/__pycache__ backend/.pytest_cache
	rm -rf backend/lambda-function.zip backend/lambda-layer.zip
	rm -rf infrastructure/.terraform
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true

setup:
	@echo "Setting up FinOps SaaS Platform..."
	@echo "1. Installing frontend dependencies..."
	cd frontend && npm install
	@echo "2. Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "3. Copying environment files..."
	cp frontend/.env.example frontend/.env.local 2>/dev/null || true
	cp backend/.env.example backend/.env 2>/dev/null || true
	@echo ""
	@echo "Setup complete! Please update the .env files with your credentials."
	@echo "Then run: make docker-up && make backend-dev & make frontend-dev"
