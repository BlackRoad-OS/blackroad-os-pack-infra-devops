#!/usr/bin/env bash
set -euo pipefail

: "${SERVICE:?SERVICE is required}"
: "${RAILWAY_TOKEN:?RAILWAY_TOKEN is required}"

APP_VERSION=${APP_VERSION:-"latest"}
GATEWAY_URL=${GATEWAY_URL:-"https://gateway.blackroad.internal/deploy"}

payload() {
  cat <<JSON
{
  "service": "${SERVICE}",
  "version": "${APP_VERSION}",
  "token": "${RAILWAY_TOKEN}"
}
JSON
}

echo "[deploy] Triggering deployment for ${SERVICE} (version=${APP_VERSION})"
response=$(curl -sS -X POST -H "Content-Type: application/json" -d "$(payload)" "${GATEWAY_URL}")

echo "[deploy] Response: ${response}"
