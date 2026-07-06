# Tazama Config Studio

A web application for managing Tazama configuration tables (`network_map`, `rule`, `typology`) in the `configuration` database.

## Architecture

- **backend/** — NestJS 11 thin proxy (port 3011). Forwards auth to `auth-service` and data to `admin-service`.
- **frontend/** — Vite + React 18 + TypeScript SPA (port 5173). MUI 7 + Ant Design 5 + Tailwind CSS.

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```
Backend runs on `http://localhost:3011`. Swagger at `http://localhost:3011/api/docs`.

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Environment

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend port | `3011` |
| `TAZAMA_AUTH_URL` | Auth-service URL | `http://localhost:3020/v1/auth` |
| `ADMIN_SERVICE_URL` | Admin-service URL | `http://localhost:5100` |
| `AUTH_PUBLIC_KEY_PATH` | Keycloak public key | `public-key.pem` |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend URL | `http://localhost:3011` |
| `VITE_APP_TITLE` | App title | `Tazama Config Studio` |

# Test Coverage

This project enforces minimum test coverage thresholds across all packages (backend and frontend). Coverage is measured for lines, branches, functions, and statements.

- **Backend**: 85% threshold for all metrics
- **Frontend**: 15% lines/statements, 55% functions, 75% branches (many UI components not yet tested)

## Running Coverage Locally

### All packages (from root)

```bash
npm run test:cov
```

### Backend only

```bash
cd backend
npm run test:cov
```

Coverage reports are output to `backend/coverage/` in JSON, LCOV, Clover, and text formats.

### Frontend only

```bash
cd frontend
npm run test:cov
```

Coverage reports are output to `frontend/coverage/` in the same formats.

## CI Integration

The [Test Coverage Check](.github/workflows/test-coverage.yml) GitHub Actions workflow runs on every push and pull request to `main` and `develop`. It:

1. Runs backend and frontend tests with coverage in parallel.
2. Checks each package's coverage against the 85% threshold.
3. **If coverage is below 85%**, it automatically opens (or updates) a GitHub issue labeled `test-coverage`, `automated`, `tech-debt` with a summary of the failing metrics.
4. **If coverage recovers to ≥ 85%**, the issue is automatically closed with a confirmation comment.

## Coverage Configuration

| Package   | Tool  | Config Location     |
|-----------|-------|---------------------|
| Backend   | Jest  | `backend/package.json` (`jest` key) |
| Frontend  | Vitest| `frontend/vite.config.ts` (`test.coverage` key) |

Both are configured with `coverageThreshold` / `thresholds` for all metrics. Tests will fail locally if coverage drops below the threshold. Backend uses 85% for all metrics; frontend uses lower thresholds due to untested UI components.
