#!/usr/bin/env bash
# Helper untuk start backend & frontend bersamaan (dev mode).
# Stop dengan Ctrl+C.

set -e
cd "$(dirname "$0")"

echo "[start] Backend (npm run dev) -> http://localhost:3002"
echo "[start] Frontend (npm run dev) -> http://localhost:3001"
echo "[start] Tekan Ctrl+C untuk stop keduanya."
echo ""

# Trap untuk kill child saat exit
cleanup() {
  echo ""
  echo "[start] Stopping..."
  kill $(jobs -p) 2>/dev/null
  exit 0
}
trap cleanup INT TERM

(cd backend && npm run dev) &
(cd frontend && npm run dev) &

wait
