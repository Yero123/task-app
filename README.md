# Multi-Tenant Task Manager

## Badges

[![API CI](https://github.com/Yero123/task-app/actions/workflows/api.yml/badge.svg)](https://github.com/Yero123/task-app/actions/workflows/api.yml)
[![Frontend CI](https://github.com/Yero123/task-app/actions/workflows/frontend.yml/badge.svg)](https://github.com/Yero123/task-app/actions/workflows/frontend.yml)
[![Coverage Status](https://coveralls.io/repos/github/Yero123/task-app/badge.svg?branch=main)](https://coveralls.io/github/Yero123/task-app?branch=main)

---

## Deployed App (Running on Cloudflare)

- **Frontend:** https://50561cf8.task-app-frontend.pages.dev/
- **API:** https://task-app.task-app-challenge-yerodin.workers.dev/
- **Swagger / OpenAPI docs:** https://task-app.task-app-challenge-yerodin.workers.dev/doc

---

## Features

- Multi-tenant task management. Each tenant only sees and manages their own tasks.
- Tenant isolation enforced at the database query level (every query filters by tenant).
- Create tasks with title and optional status (pending, done).
- Delete tasks. Cross-tenant delete attempts return 404.
- Bearer token auth. Use `token_tenant_a` or `token_tenant_b` for testing.
- Rate limiting on POST (10 requests per minute per tenant).
- OpenAPI spec and Swagger UI for API docs.

---

## Pre-requisites

- Node 22 (run `nvm use` at repo root)
- Docker and Docker Compose
- Neon Postgres database
- Cloudflare account (for deployment)

---

## How to Run the App

**With Docker:**

```bash
cp api/.env.example api/.env
# Set DATABASE_URL in api/.env
docker compose up --build
```

API at http://localhost:8787, frontend at http://localhost:5173.

**Without Docker:**

```bash
cd api && npm install && npm run dev
cd frontend && npm install && npm run dev
```

---

## How to Run the Tests

```bash
cd api
docker compose -f docker-compose.test.yml up -d --wait
npm install
npm test
docker compose -f docker-compose.test.yml down
```

Tests use a real Postgres instance. 16 tests cover auth, CRUD, and tenant isolation.

---

## Areas to Improve

- Replace static tokens with JWT.
- Use Cloudflare KV or Durable Objects for rate limiting instead of in-memory.
- Add React tests (Vitest + React Testing Library).
- Restrict CORS to specific domains instead of allowing all.
- Add Storybook to document components. For now components are simple with shadcn so not needed.
- If adding more modules or use cases in the future, consider clean architecture. For this project MVC is fine.

**Architecture decisions (why X over Y)**

- Deployed on Cloudflare because it works well with Hono and fits the edge/serverless model.
- Did not use Next.js because this is a simple task app. No need for SSR or other Next optimizations.
- Could use clean architecture but for this simple feature set MVC is enough. If we add more modules and use cases later, we can refactor to separate responsibilities.

**Trade-offs**

- In-memory rate limiting instead of KV (simpler, resets on deploy).
- Static tokens instead of JWT (faster to build, not production-ready).
- CORS allows all origins (convenient for dev, should restrict in production).

**What's missing**

- PATCH endpoint for updating tasks.
- Pagination on GET /tasks.
- Frontend tests.
- Storybook for component docs.
- Specific CORS allowlist.

---

## Errors to Fix

None currently. Open issues or known bugs can be listed here.

---

## Tech Stack

- API: Hono, Cloudflare Workers, Drizzle ORM, Neon Postgres (HTTP driver)
- Frontend: React 19, Vite, TailwindCSS, shadcn/ui, TanStack Query
- Testing: Vitest, postgres-js
- CI/CD: GitHub Actions, Cloudflare Pages, Cloudflare Workers

---

## Decisions Made

- Neon HTTP driver for Workers compatibility (no TCP, stateless).
- Tenant ID in every repository query. No app-layer filtering only.
- Repository + Service pattern. SQL in repository, business logic in service.
- Integration tests against real DB to catch SQL and tenant isolation bugs.
- Docker uses Node.js (`server.node.ts`) because workerd is not available on linux/arm64.

---

## Environment Variables

**API (`api/.env`):**

- `DATABASE_URL` – Neon Postgres connection string (required)

**Frontend (`frontend/.env`):**

- `VITE_API_URL` – API base URL (optional, defaults to http://localhost:8787)

---

## Written Responses

### 1. DMARC and DKIM on Cloudflare

DKIM adds a cryptographic signature to outgoing emails. Your provider gives you a public key to add as a TXT record in Cloudflare DNS. DMARC is a policy at `_dmarc.yourdomain.com` that tells receivers what to do when SPF or DKIM fail: none, quarantine, or reject. Start with `p=none` to collect reports, then tighten to `p=reject`.

### 2. Debugging a Multi-Tenant Data Leak

Check auth middleware for correct tenantId extraction. Audit all repository queries for `WHERE tenant_id = $tenantId`. Look for admin or debug routes that skip tenant scoping. Add tracing to compare tenantId in queries with the token. Fix by enforcing isolation in SQL and adding regression tests for cross-tenant access.

### 3. Automated Daily Backup for Neon Postgres

Use Neon PITR on the paid plan for continuous recovery. Add a cron job to run `pg_dump` and upload to R2 or S3 with GFS retention (7 daily, 4 weekly, 3 monthly). After each dump, restore to a temp branch and run a smoke query to verify. Alert if restore or query fails.

---
