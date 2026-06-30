#!/usr/bin/env bash
# Install production node_modules on the server (correct Node ABI for Passenger).
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH is required}"
cd "${DEPLOY_PATH}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="$("${SCRIPT_DIR}/resolve-server-node.sh")"
NPM_BIN="${NODE_BIN%/node}/npm"

if [ ! -x "${NPM_BIN}" ]; then
  echo "::error::npm not found next to ${NODE_BIN}"
  exit 1
fi

if [ -e node_modules ]; then
  rm -rf node_modules
fi

echo "Using node: ${NODE_BIN} ($("${NODE_BIN}" -v))"
echo "Using npm:  ${NPM_BIN} ($("${NPM_BIN}" -v))"

export NODE_ENV=production
export npm_config_audit=false
export npm_config_fund=false

"${NPM_BIN}" ci --omit=dev

echo "server-npm-ci-ok"
