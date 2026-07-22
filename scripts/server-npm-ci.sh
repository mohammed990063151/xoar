#!/usr/bin/env bash
# Install production node_modules on the server (correct Node ABI for Passenger).
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH is required}"
cd "${DEPLOY_PATH}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="$("${SCRIPT_DIR}/resolve-server-node.sh")"
NPM_BIN="${NODE_BIN%/node}/npm"
ACTIVATE="${NODE_BIN%/node}/activate"

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

# CloudLinux's Node.js Selector requires node_modules to be installed while its
# "nodevenv" is activated — it manages where packages actually live and rejects
# apps whose node_modules were created by invoking npm directly by path (this is
# what the cPanel "Run NPM Install" button does internally; a bare `npm ci`
# bypasses it and Passenger then refuses to start with "demands to store node
# modules for application in ... " even though the install itself succeeds).
if [ -f "${ACTIVATE}" ]; then
  echo "Activating CloudLinux nodevenv: ${ACTIVATE}"
  # CloudLinux's activate script references its own internal vars (e.g.
  # CL_VIRTUAL_ENV) without defaults, which trips our `set -u`. Relax nounset
  # only for the duration of sourcing/deactivating this third-party script.
  set +u
  # shellcheck disable=SC1090
  source "${ACTIVATE}"
  set -u
  npm ci --omit=dev
  set +u
  type deactivate >/dev/null 2>&1 && deactivate
  set -u
else
  echo "::warning::No nodevenv activate script at ${ACTIVATE} — falling back to direct npm invocation."
  "${NPM_BIN}" ci --omit=dev
fi

echo "server-npm-ci-ok"
