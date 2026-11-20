#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/../../../../" && pwd)"
cd "$ROOT"

echo "launch: docker compose up --build -d"
docker compose up --build -d

echo "launch: waiting for doctor"
i=0
while [ "$i" -lt 90 ]; do
  if .cursor/skills/verify-spaced-repetition/helpers/doctor.sh; then
    echo "launch: ready"
    exit 0
  fi
  i=$((i + 1))
  sleep 2
done

echo "launch: timed out waiting for doctor" >&2
docker compose ps >&2 || true
exit 1
