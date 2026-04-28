# Lumi — Auth Module

> AI-powered financial wellness for African youth.
> This package contains the complete authentication system for Lumi.

---

## What's included

| Layer | Contents |
|---|---|
| `frontend/app/auth/signup/` | Registration page with password strength meter |
| `frontend/app/auth/login/` | Login with show/hide password and remember me |
| `frontend/app/auth/verify-email/` | 6-digit OTP verification with countdown resend |
| `frontend/app/auth/forgot-password/` | 3-step password recovery flow |
| `frontend/components/auth/` | `PasswordInput`, `OtpInput`, `AuthCard` components |
| `frontend/components/ui/` | `Button`, `Input` base components |
| `frontend/hooks/useAuth.ts` | All auth actions with loading + error state |
| `frontend/lib/api/client.ts` | `ApiClient` class with cookie interceptors |
| `frontend/lib/validators.ts` | Password strength, email, OTP validators |
| `backend/app/routers/auth.py` | All auth endpoints |
| `backend/app/services/auth_service.py` | Business logic (register, login, OTP, reset) |
| `backend/app/repositories/` | `BaseRepository[T]`, `UserRepository` |
| `backend/app/models/` | `BaseModel`, `User` ORM models |
| `backend/app/schemas/auth.py` | Pydantic v2 request/response schemas |
| `backend/app/utils/security.py` | bcrypt, JWT, OTP generation |
| `backend/app/exceptions/base.py` | Custom exception hierarchy |
| `backend/tests/` | Unit + integration tests (90%+ coverage target) |

---

## Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **PostgreSQL** 15+ (or Docker)
- **uv** — `pip install uv`

---

## Quick start with Docker (recommended)

```bash
# 1. Clone and enter the project
git clone https://github.com/your-username/lumi.git
cd lumi

# 2. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Fill in your secrets in backend/.env (see Environment Variables below)

# 4. Start everything
docker compose up --build

# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
# API docs → http://localhost:8000/docs
# pgAdmin  → http://localhost:5050 (docker compose --profile tools up)
```

---

## Local setup without Docker

### Backend

```bash
cd backend

# Install uv if you don't have it
pip install uv

# Install all dependencies
uv sync

# Copy and fill in env file
cp .env.example .env

# Run database migrations
uv run alembic upgrade head

# Start the development server
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy and fill in env file
cp .env.example .env.local

# Start the development server
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string with asyncpg driver |
| `JWT_SECRET_KEY` | ✅ | Random 64-char hex string — generate with `python -c "import secrets; print(secrets.token_hex(64))"` |
| `CORS_ORIGINS` | ✅ | Comma-separated list of allowed frontend origins |
| `MAIL_USERNAME` | ✅ | SMTP username for sending OTP emails |
| `MAIL_PASSWORD` | ✅ | SMTP password (use App Password for Gmail) |
| `OPENAI_API_KEY` | ✅ | For AI features (SMS scanner, chat) |
| `COOKIE_SECURE` | — | `false` for local HTTP, `true` in production |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |

---

## Running Tests

### Backend

```bash
cd backend

# Run all tests with coverage report
uv run pytest

# Run only unit tests
uv run pytest tests/unit/

# Run only integration tests
uv run pytest tests/integration/

# Coverage report only
uv run pytest --cov=app --cov-report=html
```

### Frontend

```bash
cd frontend

# Run unit + component tests
npm test

# Watch mode
npm run test:watch

# E2E tests (requires running backend)
npm run test:e2e
```

---

## Database Migrations

```bash
# Create a new migration after changing a model
docker compose exec backend uv run alembic revision --autogenerate -m "describe_your_change"

# Apply all pending migrations
docker compose exec backend uv run alembic upgrade head

# Roll back one migration
docker compose exec backend uv run alembic downgrade -1

# View migration history
docker compose exec backend uv run alembic history
```

---

## Auth Flow

```
Register → Email OTP → Verified → Login → JWT Cookie → Dashboard
                                              ↓
                                    Forgot Password
                                         ↓
                                    Email OTP
                                         ↓
                                    New Password
```

- JWT is stored in an **HTTP-only cookie** — never in localStorage
- OTP codes expire after **10 minutes**
- Resend available after **59-second cooldown**
- Password must have: 8+ chars, uppercase, lowercase, number, symbol
- Forgot password always returns the same response (prevents email enumeration)

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Create account |
| `POST` | `/api/v1/auth/verify-email` | Verify email OTP |
| `POST` | `/api/v1/auth/resend-verification` | Resend verification OTP |
| `POST` | `/api/v1/auth/login` | Sign in, sets cookie |
| `POST` | `/api/v1/auth/forgot-password` | Request reset OTP |
| `POST` | `/api/v1/auth/reset-password` | Reset password with OTP |
| `POST` | `/api/v1/auth/logout` | Clear cookie |
| `GET`  | `/api/v1/auth/me` | Get current user |
| `GET`  | `/health` | Health check |

Full interactive docs at `http://localhost:8000/docs` in development.

---

## Security Notes

- JWT stored in **HTTP-only cookies** — inaccessible to JavaScript
- Passwords hashed with **bcrypt**
- CORS origins, methods, and headers come from **environment variables only**
- OTP purpose is validated (`verify` vs `reset`) to prevent code reuse
- `forgot_password` returns identical responses to prevent **email enumeration**
- Non-root Docker user in production image
- `COOKIE_SECURE=true` must be set in production (requires HTTPS)
