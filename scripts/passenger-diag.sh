#!/usr/bin/env bash
# Capture why Passenger cannot start (run on server after deploy).
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH is required}"
cd "${DEPLOY_PATH}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="$("${SCRIPT_DIR}/resolve-server-node.sh")"

echo "==== passenger-diag ===="
echo "date=$(date -Is)"
echo "cwd=$(pwd)"
echo "node=${NODE_BIN} ($("${NODE_BIN}" -v))"
echo "BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null || echo missing)"
echo "NODE_ENV_in_env_file=$(grep -E '^NODE_ENV=' .env 2>/dev/null || echo none)"
echo "PORT=${PORT:-unset}"
echo

echo "-- server.js head --"
head -n 20 server.js || true
echo

echo "-- try prepare with forced production (10s) --"
NODE_ENV=production timeout 15 "${NODE_BIN}" -e '
const next=require("next");
next({dev:false}).prepare().then(()=>{console.log("prepare-ok");process.exit(0);})
.catch(e=>{console.error("prepare-fail",e);process.exit(1);});
' || echo "prepare-exit=$?"
echo

echo "-- recent logs --"
for f in \
  "$HOME/logs/error_log" \
  "$HOME/logs/stderr.log" \
  "$HOME/logs/passenger.log" \
  "$HOME/nodevenv/public_html/xoraevents.com/xoar/24/var/log/stderr.log" \
  "$HOME/nodevenv/public_html/xoraevents.com/xoar/24/var/log/passenger.log" \
  "${DEPLOY_PATH}/tmp/stderr.log" \
  "${DEPLOY_PATH}/stderr.log"
do
  if [ -f "$f" ]; then
    echo "---- $f (tail) ----"
    tail -n 40 "$f" || true
  fi
done

LATEST_LOG="$(ls -1t "$HOME/logs/"*xoraevents* 2>/dev/null | head -n 1 || true)"
if [ -n "${LATEST_LOG}" ]; then
  echo "---- ${LATEST_LOG} (tail) ----"
  (zcat -f "${LATEST_LOG}" 2>/dev/null || cat "${LATEST_LOG}") | tail -n 60 || true
fi

echo "==== passenger-diag-end ===="
