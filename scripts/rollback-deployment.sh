#!/usr/bin/env bash
# Restore the last backup and restart Passenger (run via SSH on smoke-test failure).
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH is required}"
BACKUP="${DEPLOY_PATH}/.deploy-backup"

if [ ! -d "${BACKUP}/.next" ]; then
  echo "::error::No rollback backup at ${BACKUP}/.next — cannot restore live site."
  exit 1
fi

echo "::warning::Rolling back live site to previous release ..."

cd "${DEPLOY_PATH}"

for item in .next public server.js package.json package-lock.json next.config.mjs .htaccess .env; do
  if [ -e "${BACKUP}/${item}" ]; then
    echo "  restore: ${item}"
    rm -rf "${item}"
    cp -a "${BACKUP}/${item}" "${item}"
  fi
done

if [ -x "${DEPLOY_PATH}/scripts/fix-deploy-permissions.sh" ]; then
  DEPLOY_PATH="${DEPLOY_PATH}" "${DEPLOY_PATH}/scripts/fix-deploy-permissions.sh"
fi

mkdir -p tmp

if [ -f .next/BUILD_ID ]; then
  echo "Restored BUILD_ID=$(cat .next/BUILD_ID)"
fi

if [ "${SKIP_PASSENGER_RESTART:-}" != "1" ]; then
  touch tmp/restart.txt
  echo "Rollback complete — Passenger restart triggered."
else
  echo "Rollback complete — Passenger left running (live process unchanged)."
fi
