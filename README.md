# Spaced Repetition Reminder

Learners register, create Task Cards, and get an automatic multi-month review calendar.

## Stack

- `apps/api` — NestJS + Prisma
- `apps/web` — Next.js App Router
- `libs/shared-types` — shared TypeScript types
- Postgres 16 and Redis 7 via Docker Compose

## Run (Docker only)

```bash
docker compose up --build
```

| Service | Host port |
| ------- | --------- |
| Web     | 3000      |
| API     | 4000      |

Postgres and Redis stay on the Compose network only (`postgres:5432`, `redis:6379`).

Health check: `GET http://localhost:4000/health` → `{ "status": "ok" }`

Copy `.env.example` to `.env` for local overrides. Compose already injects non-secret defaults for the stack.
