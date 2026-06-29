#!/usr/bin/env bash
# Fix common cPanel permission issues after rsync or rollback.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH is required}"
cd "${DEPLOY_PATH}"

if [ -d node_modules/.bin ]; then
  find node_modules/.bin -type f -exec chmod u+x {} + 2>/dev/null || true
fi

if [ -d node_modules ]; then
  chmod -R u+rwX,go+rX node_modules 2>/dev/null || true
fi

for f in server.js package.json next.config.mjs .htaccess; do
  [ -f "${f}" ] && chmod 644 "${f}" || true
done

echo "Permissions normalized under ${DEPLOY_PATH}"
