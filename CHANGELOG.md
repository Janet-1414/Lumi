# Changelog

All notable changes to Lumi are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- Full authentication system with HTTP-only JWT cookies
- Email OTP verification on signup
- Forgot password 3-step recovery flow (email → OTP → new password)
- Dashboard with stat cards, spending donut chart, AI insight banner
- Transactions page with paginated list, filter pills, search
- MTN Mobile Money SMS Scanner powered by LangChain + GPT-4o-mini
- Scan → preview → confirm flow with editable fields
- Savings Goals page with progress bars, deposit flow, streak banner
- AI savings challenge generation
- Investment hints (locked until discipline threshold reached)
- AI Chat powered by LangGraph ReAct agent with 4 financial tools
- Streaming responses via Server-Sent Events
- Reports page with 6-month bar chart, category donut, AI written summary
- Community page — Feed, Challenges, Leaderboard (% only), Tips
- Full anonymity enforcement — no real names or amounts in community
- Profile page with money personality badge, badge grid, settings
- Docker setup (dev + prod + test compose files)
- GitHub Actions CI/CD pipeline (lint → test → deploy)
- uv for Python dependency management with lockfile
- Alembic database migrations from day one
- LangSmith observability for all AI calls
- 90%+ test coverage target with unit + integration + E2E tests
- Midnight Gold design system (dark-first, glassmorphism, Sora + DM Sans)

### Architecture
- Next.js 14 (App Router) frontend on Vercel
- FastAPI + LangGraph backend on Railway
- PostgreSQL database on Railway
- Repository pattern for all DB access
- Abstract base classes: BaseRepository, BaseService, BaseAIService
- Custom exception hierarchy from LumiBaseException
- Settings(BaseSettings) — everything from environment variables
- Zustand for global frontend state

---

## [0.1.0] — 2025-01-15

- Initial project setup
- Project structure defined
- Midnight Gold color palette selected
- Tech stack confirmed: Next.js + FastAPI + LangGraph + PostgreSQL
