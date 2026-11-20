---
name: verify-spaced-repetition
description: "Drive the Spaced Repetition Reminder Docker stack (Next.js web + Nest API) the way a user does. Use when proving Slice behavior, auth flows, Task Cards, or calendar reminders against the live compose app."
---

# Verify Spaced Repetition Reminder

Primary surface: the Next.js web app at `http://localhost:3000`. Secondary surface: Nest API at `http://localhost:4000` (health and auth JSON). Stack boots only through Docker Compose.

## Launch

From the repo root:

```bash
.cursor/skills/verify-spaced-repetition/helpers/launch.sh
```

Ready when:

1. `helpers/doctor.sh` exits `0`
2. `GET http://localhost:4000/health` returns `{"status":"ok"}`
3. `GET http://localhost:3000` returns HTTP `200`

Launch runs `docker compose up --build -d` and waits until doctor passes (migrations run inside the API entrypoint). Do not treat a container "Up" status alone as ready.

Teardown after a verification run:

```bash
.cursor/skills/verify-spaced-repetition/helpers/cleanup.sh
```

Cleanup stops compose services started for verification. It does **not** delete files under `artifacts/`.

## Doctor

```bash
.cursor/skills/verify-spaced-repetition/helpers/doctor.sh
```

Checks (read-only):

- `api` and `web` containers are running for this compose project
- API health JSON is `{"status":"ok"}`
- Web homepage returns HTTP `200`

Exit `0` only when all checks pass. Run doctor first whenever anything looks off.

## Drive

**API.** Prefer `curl` with cookie jars for auth and reviews. Example health:

```bash
curl -sf http://localhost:4000/health
```

**Web.** Drive with the Cursor IDE browser tools (`browser_navigate`, `browser_snapshot`, `browser_fill`, `browser_click`, `browser_take_screenshot`). Prefer accessible names and headings over CSS selectors.

Stable handles today:

| Surface | Handle |
| --- | --- |
| Landing | Heading `Spaced Repetition Reminder`; links `Register`, `Log in` |
| API health | Path `/health`, body `status` field `ok` |
| Auth | `/register`, `/login`, `/dashboard`; button `Log out` |
| Task Cards | `/cards`, `/cards/new`, button `Create card` |
| Calendar / Reminders | `/calendar`, `/reminders`; Complete on due rows |

See the feature map for full journeys.

**Isolation.** Default ports are `3000` and `4000`. Two agents must not drive the same compose project at once. Do not attach to a stack you did not launch (or the shared session stack the operator already left up for this branch). If doctor fails because ports are owned by another project, stop and report; do not kill foreign containers by name.

## Evidence

Write proof under:

```text
.cursor/skills/verify-spaced-repetition/artifacts/<feature-id>/
```

Standards:

- Exercise the real user path (browser UI or public HTTP), not internal setters
- Capture the action and the resulting state (request + response, or snapshot + screenshot)
- For mutations, confirm a second read (for example `GET /auth/me` after register)
- Keep mocks only at true external boundaries (none required for MVP)

Minimum for a web proof: ARIA/accessibility snapshot text plus a screenshot that shows the product name. Minimum for an API proof: command, status code, and response body saved as files.

## Cleanup

```bash
.cursor/skills/verify-spaced-repetition/helpers/cleanup.sh
```

Stops `docker compose` for this repo. Leaves `artifacts/` intact. Never kill by process name.

## Helpers

| Script | Purpose |
| --- | --- |
| `helpers/launch.sh` | `docker compose up --build -d` + wait for doctor |
| `helpers/doctor.sh` | Read-only readiness |
| `helpers/cleanup.sh` | `docker compose down` (keeps volumes by default) |

All helpers are executable and must be run from any cwd (they `cd` to the repo root). They need a working Docker daemon socket (outside restricted sandboxes).

## Feature map

See [features/README.md](features/README.md).