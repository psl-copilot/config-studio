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
