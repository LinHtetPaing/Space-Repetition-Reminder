#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/../../../../" && pwd)"
cd "$ROOT"

fail() {
  echo "doctor: $1" >&2
  exit 1
}

docker compose ps --status running --services 2>/dev/null | grep -qx api || fail "api container not running"
docker compose ps --status running --services 2>/dev/null | grep -qx web || fail "web container not running"

health="$(curl -sf http://localhost:4000/health)" || fail "API /health not reachable"
echo "$health" | grep -q '"status":"ok"' || fail "API /health unexpected body: $health"

code="$(curl -sf -o /dev/null -w '%{http_code}' http://localhost:3000)" || fail "web not reachable"
[ "$code" = "200" ] || fail "web returned HTTP $code"

echo "doctor: ok (api health + web 200)"
exit 0
