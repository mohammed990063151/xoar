#!/usr/bin/env bash
# Verify Next.js can prepare on the server (catches Passenger startup failures early).
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH is required}"
cd "${DEPLOY_PATH}"

if [ ! -f .next/BUILD_ID ]; then
  echo "::error::Missing .next/BUILD_ID on server"
  exit 1
fi

if [ ! -f node_modules/next/package.json ]; then
  echo "::error::Missing node_modules/next on server"
  exit 1
fi

if [ -f .env ] && grep -qE '^NODE_ENV=' .env; then
  echo "::error::Remove NODE_ENV from server .env"
  exit 1
fi

NODE_BIN=""
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  for candidate in \
    "${HOME}/nodevenv/public_html/xoraevents.com/xoar/24/bin/node" \
    "${HOME}/nodevenv/public_html/xoraevents.com/xoar/22/bin/node" \
    "${HOME}/nodevenv/public_html/xoraevents.com/xoar/20/bin/node"
  do
    if [ -x "${candidate}" ]; then
      NODE_BIN="${candidate}"
      break
    fi
  done
fi

if [ -z "${NODE_BIN}" ]; then
  NODE_BIN="$(find "${HOME}/nodevenv" -path '*/bin/node' -type f 2>/dev/null | head -n 1 || true)"
fi

if [ -z "${NODE_BIN}" ] || [ ! -x "${NODE_BIN}" ]; then
  echo "::error::node binary not found on server PATH or nodevenv"
  exit 1
fi

echo "Using node: ${NODE_BIN} ($("${NODE_BIN}" -v))"
echo "Running next.prepare() on server (BUILD_ID=$(cat .next/BUILD_ID)) ..."

NODE_ENV=production timeout 90 "${NODE_BIN}" <<'NODE'
const next = require("next");
const app = next({ dev: false });
app
  .prepare()
  .then(() => {
    console.log("next-prepare-ok");
    process.exit(0);
  })
  .catch((err) => {
    console.error("next-prepare-failed", err);
    process.exit(1);
  });
NODE
