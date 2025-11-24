#!/usr/bin/env bash
set -euo pipefail

: "${SERVICE:?SERVICE is required}"
: "${RAILWAY_TOKEN:?RAILWAY_TOKEN is required}"

TARGET_SHA=${TARGET_SHA:-"previous"}
GATEWAY_URL=${GATEWAY_URL:-"https://gateway.blackroad.internal/rollback"}

payload() {
  cat <<JSON
{
  "service": "${SERVICE}",
  "target": "${TARGET_SHA}",
  "token": "${RAILWAY_TOKEN}"
}
JSON
}

echo "[rollback] Initiating rollback for ${SERVICE} to ${TARGET_SHA}"
response=$(curl -sS -X POST -H "Content-Type: application/json" -d "$(payload)" "${GATEWAY_URL}")

echo "[rollback] Response: ${response}"
