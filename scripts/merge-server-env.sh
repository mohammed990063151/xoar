#!/usr/bin/env bash
# Merge .env.deploy keys into existing server .env (never wipe the whole file).
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH is required}"
cd "${DEPLOY_PATH}"

if [ ! -f .env ]; then
  if [ -f .env.deploy ]; then
    mv .env.deploy .env
  fi
  exit 0
fi

if [ ! -f .env.deploy ]; then
  exit 0
fi

for key in API_PROXY_TARGET NEXT_PUBLIC_API_URL NEXT_PUBLIC_ADMIN_URL NEXT_PUBLIC_PORTAL_URL NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_GTM_ID FRONTEND_API_KEY; do
  line="$(grep -m1 "^${key}=" .env.deploy 2>/dev/null || true)"
  if [ -n "$line" ]; then
    grep -v "^${key}=" .env > .env.tmp || true
    printf '%s\n' "$line" >> .env.tmp
    mv .env.tmp .env
  fi
done

rm -f .env.deploy
echo "Server .env merged from .env.deploy"
