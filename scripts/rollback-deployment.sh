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

for item in .next public node_modules server.js package.json package-lock.json next.config.mjs .htaccess; do
  if [ -e "${BACKUP}/${item}" ]; then
    echo "  restore: ${item}"
    rm -rf "${item}"
    cp -a "${BACKUP}/${item}" "${item}"
  fi
done

mkdir -p tmp
touch tmp/restart.txt

if [ -f .next/BUILD_ID ]; then
  echo "Restored BUILD_ID=$(cat .next/BUILD_ID)"
fi

echo "Rollback complete — Passenger restart triggered."
