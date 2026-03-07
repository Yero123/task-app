# Multi-Tenant Task Manager

This project is a Full-stack multi-tenant task management. Each tenant has isolated data at the database level. Create, list, and delete tasks. Switch between tenants to see the isolation in action. The API enforces tenant scoping at the query level. Built with Hono on Cloudflare Workers, React on Cloudflare Pages, and Neon Postgres.

## Badges

[![API CI](https://github.com/Yero123/task-app/actions/workflows/api.yml/badge.svg)](https://github.com/Yero123/task-app/actions/workflows/api.yml)
[![Frontend CI](https://github.com/Yero123/task-app/actions/workflows/frontend.yml/badge.svg)](https://github.com/Yero123/task-app/actions/workflows/frontend.yml)
[![Coverage Status](https://coveralls.io/repos/github/Yero123/task-app/badge.svg?branch=main)](https://coveralls.io/github/Yero123/task-app?branch=main)

---

## Deployed App (Running on Cloudflare)

- **Frontend:** https://e491d515.task-app-frontend.pages.dev/
- **API:** https://task-app.task-app-challenge-yerodin.workers.dev/
- **Swagger / OpenAPI docs:** https://task-app.task-app-challenge-yerodin.workers.dev/ui

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

## Tech Stack

- API: Hono, Cloudflare Workers, Drizzle ORM, Neon Postgres (HTTP driver), Zod, @hono/zod-openapi, Swagger UI
- Frontend: React 19, Vite, TailwindCSS, shadcn/ui, TanStack Query, React Hook Form, @hookform/resolvers, Zod, Lucide React, Sonner
- Testing: Vitest, postgres-js
- CI/CD: GitHub Actions, Cloudflare Pages, Cloudflare Workers

---

## Decisions Made

- Every repository method receives tenantId and adds it to the SQL WHERE clause. No app-layer filtering only.
- Repository handles persistence data and service handles business logic
- Integration tests run against real Postgres. Catches SQL bugs and missing tenant filters that mocks would miss.
- workerd is not on linux/arm64, so Docker uses server.node.ts (Node) (this was to dockerized the app to be easy to run). index.ts deploys to Workers.
- Zod for validation, types, and OpenAPI in one schema. Used on API and frontend.
- React Hook Form with Zod resolvers. Uncontrolled refs, less re-renders, built-in error state.


## Areas to Improve

- CI auto-deploy is missing. The API workflow runs type-check and tests only. Deploy to Cloudflare Workers is done manually (`cd api && npx wrangler secret put DATABASE_URL` then `npx wrangler deploy`).
- Replace static tokens with JWT.
- Use Cloudflare KV or Durable Objects for rate limiting instead of in-memory.
- Add React tests (Vitest + React Testing Library).
- Restrict CORS to specific domains instead of allowing all.
- Add Storybook to document components. For now components are simple with shadcn so not needed.
- If adding more modules or use cases in the future, consider clean architecture. For this project MVC is fine.

**Architecture decisions**

- Deployed on Cloudflare because it works well with Hono and fits the edge/serverless model.
- Did not use Next.js because this is a simple task app. No need for SSR or other Next optimizations.
- Could use clean architecture but for this simple feature set MVC is enough. If we add more modules and use cases later, we can refactor to separate responsibilities.

**Trade-offs**

- In-memory rate limiting instead of KV (simpler, resets on deploy).
- Static tokens instead of JWT (faster to build, not production-ready).

---

## Environment Variables

**API (`api/.env`):**

- `DATABASE_URL` – Neon Postgres connection string (required)

**Frontend (`frontend/.env`):**

- `VITE_API_URL` – API base URL (optional, defaults to http://localhost:8787)

---

## Written Responses

### 1. How would you approach implementing DMARC and DKIM configuration for a platform hosted on Cloudflare? What is the purpose of each?

DKIM and DMARC are both about making sure your emails are trusted. DKIM proves the email actually came from your domain, DMARC defines what happens when it doesn't. For DMARC I'd add another TXT record and go straight to p=reject since we want emails that fail verification to be blocked completely.

For implementation, I'd generate a DKIM key pair and add the public key as a TXT record in Cloudflare DNS, the private key goes into the email service like Resend or SendGrid

### 2. A user reports they can see tasks that don't belong to them. Walk us through how you would debug and fix this in a multi-tenant system.

First I'd open our observability tool like Sentry, Coralogix, or similar, and find the exact API call the user made. I'd check the request headers to confirm their tenant identity and see what filters were actually hitting the database.

Then I'd trace that endpoint in the repository. The most common cause I've seen is a missing tenantId filter in the query. Sometimes it's a join that loses tenant context halfway through, or middleware that isn't injecting the tenant correctly into the request.

### 3. What would your automated daily database backup strategy look like for a Neon Postgres database? How would you verify it's working?

Neon handles backups natively through point-in-time recovery, so I'd leverage that instead of building a custom solution. It keeps up to 7 days of history automatically and restoring to any moment is almost instant using Neon's branching feature.

For verification, in a previous project we had a backup running every night but when we actually needed to restore it, the data was corrupted. Since then I always set up a periodic restore test into a separate branch just to confirm everything is actually recoverable, not just that the job ran successfully.

I'd also add a simple Slack or email notification after each restore test with success/failure status and row count, so the team always has confidence the strategy is actually working.

---
