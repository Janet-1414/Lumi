# Contributing to Lumi

Thank you for contributing to Lumi! This guide keeps the codebase
clean, consistent, and production-ready.

---

## Branch naming

All branches must follow this format:

```
type/short-description
```

| Type       | When to use |
|---|---|
| `feat/`    | New feature |
| `fix/`     | Bug fix |
| `refactor/`| Code refactoring, no behaviour change |
| `test/`    | Adding or updating tests |
| `docs/`    | Documentation only |
| `chore/`   | Dependency updates, config, build |

**Examples:**
```
feat/sms-receipt-scanner
fix/otp-expiry-check
refactor/transaction-repository
test/chat-agent-streaming
docs/api-endpoints
```

---

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

Optional longer body.
```

**Examples:**
```
feat(scanner): add MTN MoMo SMS parsing with LangChain
fix(auth): handle expired OTP codes correctly
test(community): verify no amounts leak through leaderboard
```

---

## Pull Request checklist

Before opening a PR, confirm all of these:

**Code quality**
- [ ] `uv run ruff check .` passes with no errors
- [ ] `uv run mypy app/` passes with no errors (backend)
- [ ] `npm run type-check` passes (frontend)
- [ ] No `console.log`, `print()`, or debug statements left in code
- [ ] No hardcoded secrets, API keys, or connection strings
- [ ] No duplicated code — extract to shared utility if used twice

**Tests**
- [ ] New features have corresponding unit tests
- [ ] All existing tests still pass (`uv run pytest` / `npm test`)
- [ ] Test coverage has not decreased
- [ ] Community privacy tests still pass (critical)

**Frontend**
- [ ] `npm run lint` passes
- [ ] Works on mobile viewport (380px)
- [ ] Dark mode looks correct
- [ ] New components follow the Midnight Gold design system
- [ ] No new direct DOM manipulation (use React state)
- [ ] Placeholder data used for polished UI where API isn't connected

**Backend**
- [ ] New routes registered in `app/main.py`
- [ ] New models imported in `migrations/env.py`
- [ ] Alembic migration created for schema changes
- [ ] All config values from environment variables, nothing hardcoded
- [ ] CORS origins still from env vars only
- [ ] JWT stored in HTTP-only cookies only

**Security**
- [ ] No user data exposed that shouldn't be (especially community)
- [ ] Leaderboard only shows percentage, never amounts
- [ ] No PII logged in structured logs

---

## Code standards

### Python (backend)

- Python 3.11+
- Type annotations on every function (`def foo(x: str) -> bool:`)
- Classes for services, repositories, and AI modules
- Abstract base classes for shared interfaces
- Pydantic v2 for all request/response schemas
- SQLAlchemy async sessions — never sync
- All dependencies injected via FastAPI `Depends()`
- Never write raw SQL — use SQLAlchemy ORM

### TypeScript (frontend)

- Strict TypeScript (`"strict": true` in tsconfig)
- No `any` types
- Named exports for components, default export for pages
- `forwardRef` on all form components
- Custom hooks for all data fetching (`use` prefix)
- `useCallback` and `useMemo` for expensive operations
- No `localStorage` for sensitive data — cookies only

### Testing

- Backend: aim for 90%+ coverage with `pytest`
- Frontend: test all components with `@testing-library/react`
- E2E: Playwright tests for the 3 real AI features
- Always mock external services (OpenAI, email) in tests
- Never hit a real database in unit tests

---

## Local development

```bash
# Start everything
docker compose up --build

# Backend tests
cd backend && uv run pytest --cov

# Frontend tests
cd frontend && npm test

# Type check
cd frontend && npm run type-check
cd backend  && uv run mypy app/

# Lint
cd backend  && uv run ruff check .
cd frontend && npm run lint
```

---

## Questions?

Open an issue or start a discussion. We review PRs within 48 hours.
