#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/../../../../" && pwd)"
cd "$ROOT"

echo "cleanup: docker compose down (volumes kept; artifacts kept)"
docker compose down
echo "cleanup: done"
