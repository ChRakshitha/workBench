# Project Workbench

A personal project management system for tracking projects across different areas of life.

It has a single owner account. When signed in, the owner can create and edit projects, categories, tags, checklists, links and comments. Visitors who aren't signed in get a read-only view of the projects list.

## Tech stack

| Part | Stack |
| --- | --- |
| `apps/web` | React 19, Vite, Tailwind CSS, TanStack Query, React Hook Form + Zod |
| `apps/api` | Fastify, Drizzle ORM, Zod, JWT session cookie |
| Database | PostgreSQL 16 (via Docker) |

The repo is a pnpm workspace. In development the web app runs on port 5173 and forwards `/api/*` requests to the API on port 3001.

## Prerequisites

- Node.js 24+
- pnpm 10 (`corepack enable` sets it up from the version pinned in `package.json`)
- Docker Desktop

## Getting started

```bash
# 1. Install dependencies
corepack enable
pnpm install

# 2. Start Postgres (exposed on port 5433, not 5432)
docker compose up -d

# 3. Configure the API: copy the example, then set JWT_SECRET to a long random string
cp apps/api/.env.example apps/api/.env

# 4. Create the tables and the owner account
pnpm --filter api db:migrate
pnpm --filter api db:seed

# 5. Run the web app and API together
pnpm dev
```

Open http://localhost:5173 and sign in with the seeded account:

- Email: `owner@example.com`
- Password: `changeme123`

The seed only runs if no user exists yet, so running it again is safe.

## Day-to-day

Make sure Docker Desktop is running, then run `pnpm dev`. The database container restarts automatically.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Runs the web app and the API together |
| `pnpm format` | Formats the repo with Prettier |
| `pnpm --filter web lint` | Lints the web app |
| `pnpm --filter web build` | Type-checks and builds the web app |
| `pnpm --filter api build` | Compiles the API to `apps/api/dist` |
| `pnpm --filter api db:generate` | Generates a migration after changing `apps/api/src/db/schema.ts` |
| `pnpm --filter api db:migrate` | Applies pending migrations |
| `pnpm --filter api db:studio` | Opens Drizzle Studio to browse the database |
| `pnpm --filter api db:seed` | Creates the owner account |

## Environment variables

`apps/api/.env`:

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `3001`) |
| `DATABASE_URL` | Postgres connection string. The example value matches `docker-compose.yml` |
| `JWT_SECRET` | Secret used to sign session cookies. Required |

## Project structure

```
apps/
  api/
    drizzle/          SQL migrations
    src/
      db/             schema, connection, seed
      routes/         HTTP routes (auth, projects, categories, tags, ...)
      services/       business logic
      repositories/   database queries
      validation/     Zod request schemas
  web/
    src/
      pages/          route-level pages
      features/       feature hooks, API calls and forms
      components/     layout and shared UI (shadcn/ui)
docker-compose.yml    local Postgres
```
