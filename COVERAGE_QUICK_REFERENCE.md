# Test Coverage - Quick Reference

## Current Status

| Component | Coverage | Status | Priority |
|-----------|----------|--------|----------|
| **Backend (Python)** | 94.19% | ✓ Excellent | Maintain |
| **Frontend (React)** | 31.13% | ~ Moderate | Improve |
| **Overall** | ~60% | ~ Needs Work | Medium-High |

---

## Running Tests Locally

### Backend Tests
```bash
cd backend
python -m pytest tests
# With coverage report:
python -m pytest -c pytest.ini backend/tests
```

### Frontend Tests
```bash
cd frontend
npm test                    # Run tests in watch mode
npm run test:coverage       # Run with coverage report
```

---

## Coverage Reports Location

### Backend
- **Coverage Report**: `backend/coverage.xml` (Cobertura XML)
- **HTML Report**: `backend/htmlcov/index.html`
- **Last Generated**: October 28, 2021 (from coverage.xml)

### Frontend
- **Coverage Report**: `frontend/coverage/lcov.info` (LCOV format)
- **HTML Report**: `frontend/coverage/lcov-report/index.html`
- **Last Generated**: October 29, 2025

---

## What's Well-Tested (100% Coverage)

### Backend Modules
- `auth/totp.py` - TOTP authentication
- `auth/utils.py` - Auth utilities
- `crypto/hashing.py` - Password hashing
- `middleware/logger.py` - Logging middleware
- `utils/limiter.py` - Rate limiting
- `utils/sanitize.py` - Input sanitization

### Frontend Files
- Core components: `Header`, `NavBar`, `Sidebar`, `Toast`
- Chat components: `MessageBubble`, `GroupMessageBubble`, `MessageInput`, `SignToggle`
- Store modules: `userStore`, `chatStore`, `useAuth`
- Routes & Guards: `RouteGuards`, `AppRoutes`
- Utils: `logger.ts`, `validators.ts`

---

## Critical Gaps (0% Coverage)

### Backend
- Database models (`model/models.py`)
- API endpoints (`endpoints/chat.py`, `endpoints/chain.py`)
- OAuth2 routes (`auth/google/routes.py`)
- Auth router (`routers/auth.py`)
- Pydantic schemas (`schemas/schemas.py`)

### Frontend
- Chat pages (P2P & Group) - 342 lines untested
- Auth pages (Login & SignUp) - 210 lines untested
- Request Interface page - 214 lines untested
- App routing - 43 lines untested

---

## Testing Frameworks Used

| Layer | Framework | Version | Coverage Tool |
|-------|-----------|---------|----------------|
| Backend | pytest | 8.3.4 | coverage.py 7.11.0 |
| Frontend | Vitest | 2.1.5 | V8 (@vitest/coverage-v8) |

---

## CI/CD Integration

**Workflow**: `.github/workflows/sonarcloud.yml`

Runs on every:
- Push to any branch
- Pull request (opened, synchronized, reopened)

**Process**:
1. Run backend tests + coverage → `backend/coverage.xml`
2. Run frontend tests + coverage → `frontend/coverage/lcov.info`
3. Upload both to SonarCloud for analysis

**SonarCloud**: https://sonarcloud.io
- Project: `20JS0Arg3Her28_cifrados_p2`
- Organization: `20js0arg3her28`

---

## Configuration Files

| File | Purpose |
|------|---------|
| `backend/pytest.ini` | pytest configuration (cov settings) |
| `.coveragerc` | Backend coverage.py configuration |
| `frontend/vite.config.ts` | Frontend Vitest config (coverage settings) |
| `sonar-project.properties` | SonarCloud configuration |
| `.github/workflows/sonarcloud.yml` | CI/CD workflow |

---

## Key Metrics

**Backend** (10/21 files have tests):
- Total Lines: 310
- Covered: 292 (94.19%)
- Files Tested: 10
- Files Untested: 11 (mostly API/DB layer)

**Frontend** (20/27 files have tests):
- Total Lines: 1,227
- Covered: 382 (31.13%)
- Files Tested: 20 (100% coverage)
- Files Untested: 7 (mainly page components)

---

## Recent Improvements

**Frontend coverage trend**:
- Before: 24%
- Current: 31%
- Improvement: +7% (ongoing effort to increase)

Recent commits show active work on increasing coverage:
- feat: adding coverage
- feat: Increase frontend coverage from 24% to 31%
- feat: adding more tests

---

## Recommendations

### Immediate Actions (High Priority)
1. Add tests for main API endpoints (chat, chain)
2. Add tests for database models
3. Increase frontend coverage to 50%+ for page components

### Medium Term
1. Add OAuth2 integration tests
2. Complete frontend page coverage to 80%+
3. Establish minimum coverage thresholds

### Long Term
1. Achieve 85%+ overall coverage
2. Add branch/conditional coverage tracking
3. Create testing guidelines/patterns doc
