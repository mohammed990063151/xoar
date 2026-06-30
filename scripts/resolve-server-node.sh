#!/usr/bin/env bash
# Print the Node.js binary Passenger/cPanel should use for this app.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/home/cjfyc2evye0k/public_html/xoraevents.com/xoar}"

NODE_BIN=""

# Prefer the nodevenv tied to this application root (matches cPanel Node.js app).
if [ -d "${HOME}/nodevenv" ]; then
  rel="${DEPLOY_PATH#${HOME}/}"
  for candidate in \
    "${HOME}/nodevenv/${rel}/24/bin/node" \
    "${HOME}/nodevenv/${rel}/22/bin/node" \
    "${HOME}/nodevenv/${rel}/20/bin/node"
  do
    if [ -x "${candidate}" ]; then
      NODE_BIN="${candidate}"
      break
    fi
  done

  if [ -z "${NODE_BIN}" ]; then
    NODE_BIN="$(find "${HOME}/nodevenv/${rel}" -path '*/bin/node' -type f 2>/dev/null | sort -V | tail -n 1 || true)"
  fi
fi

if [ -z "${NODE_BIN}" ] && command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
fi

if [ -z "${NODE_BIN}" ] || [ ! -x "${NODE_BIN}" ]; then
  echo "::error::node binary not found for ${DEPLOY_PATH}" >&2
  exit 1
fi

echo "${NODE_BIN}"
