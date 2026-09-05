#!/bin/sh
set -eu
# The platform sandbox roots at /workspace; a local/Windows checkout of the
# same repo roots at this file's own directory. Prefer the sandbox path and
# fall back so the script stays runnable in both places.
if [ -d /workspace ]; then
  cd /workspace
else
  cd "$(dirname "$0")"
fi
# :8081 is QA-only — a revive must never inherit a stale built-output preview.
node scripts/preview.mjs stop || true
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
