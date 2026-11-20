# Stack health

Stack health proves the Dockerized API answers ready and the published web/API surfaces are reachable.

## Sub-features

- `health-api` returns JSON status ok from `/health`.
- `health-doctor` passes the project doctor script.

## How to get to it (user POV)

- Open or request `http://localhost:4000/health` after `docker compose up`.
- Run the verification doctor from the repo.

## Driving it with curl and helpers

Preconditions:

- Compose project for this repo is running (launch helper or operator stack).
- Ports `4000` and `3000` reach this project's containers.

- **Doctor.** Run `.cursor/skills/verify-spaced-repetition/helpers/doctor.sh`. Exit code `0` and stdout contains `doctor: ok`.
- **API health.** Run `curl -sf http://localhost:4000/health`. Body is `{"status":"ok"}`.
- **Proof.** Save the body: `curl -sf http://localhost:4000/health > .cursor/skills/verify-spaced-repetition/artifacts/stack-health/health.json`. File content must include `"status":"ok"`.

## Gotchas

- Container `Up` without doctor can still mean migrations are unfinished. Wait for doctor.
- `doctor.sh` only asserts running `api` and `web` plus HTTP checks. Postgres and Redis are compose dependencies of `api` (internal network, healthgated) and are not named in the doctor script.
- Host Redis or Postgres on published ports is irrelevant; this compose keeps DB/cache internal.
