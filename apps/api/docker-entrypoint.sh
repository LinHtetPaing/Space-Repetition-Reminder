#!/bin/sh
set -e

echo "Running Prisma migrations..."
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma

echo "Starting API..."
exec node dist/main.js
