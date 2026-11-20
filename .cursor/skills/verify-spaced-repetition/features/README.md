# Spaced Repetition Reminder verification map

Maintained source for proving user-facing behavior of the Dockerized app. Read this index, then open the matching feature file.

## Baseline preconditions

- Repo root is the compose project directory.
- Prefer a stack started by `helpers/launch.sh`, or the operator's already-running Slice branch stack that passes `helpers/doctor.sh`.
- Web: `http://localhost:3000`. API: `http://localhost:4000`.
- Do not drive a foreign compose project on the same ports.
- Run `helpers/doctor.sh` before any journey.

## Driving conventions

- Start from doctor-green unless a feature lists extra preconditions.
- Prefer headings, link names, and form labels over CSS selectors.
- Treat helper and curl commands as literal.
- Browser actions use Cursor IDE browser tools.
- API actions use `curl` (with cookie jars once auth exists).
- Keep proof under `artifacts/<feature-id>/`. Cleanup must not delete those files.

## Proof and skip reporting

- Capture action and resulting state.
- Web proof: accessibility snapshot + screenshot with the product name visible.
- API proof: status code + body file.
- Mutations need a second read.
- Record the feature ID with every artifact.
- If a mapped path is not shipped yet, report failure with the unmet precondition. Do not call a different path "verified" for that feature.

## Features

- [Stack health](./stack-health.md) — API `/health` and compose readiness.
- [Landing page](./landing-page.md) — public homepage shell.
- [Auth register and login](./auth-register-login.md) — Slice 1 auth journeys (fail until routes ship).
