#!/usr/bin/env bash
# Snapshot the current live release on the server (run via SSH before rsync).
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH is required}"
BACKUP="${DEPLOY_PATH}/.deploy-backup"

echo "Backing up current live release under ${BACKUP} ..."

rm -rf "${BACKUP}"
mkdir -p "${BACKUP}"

cd "${DEPLOY_PATH}"

# Do not backup node_modules (huge; cp -a often breaks symlinks/permissions on cPanel).
for item in .next public server.js package.json package-lock.json next.config.mjs .htaccess .env; do
  if [ -e "${item}" ]; then
    echo "  backup: ${item}"
    cp -a "${item}" "${BACKUP}/"
  fi
done

if [ -f "${BACKUP}/.next/BUILD_ID" ]; then
  echo "Previous BUILD_ID=$(cat "${BACKUP}/.next/BUILD_ID")"
else
  echo "::warning::No previous BUILD_ID in backup (first deploy or incomplete tree)."
fi

echo "Backup complete."
