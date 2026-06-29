#!/usr/bin/env bash
# Post-deploy checks — run in CI after rsync or manually on the server.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/home/cjfyc2evye0k/public_html/xoraevents.com/xoar}"
SITE_URL="${SITE_URL:-https://xoraevents.com}"
API_URL="${API_URL:-https://xoraplus.com}"
MODE="${1:-local}" # local = check filesystem only; remote = SSH + HTTP

fail() {
  echo "::error::$1" >&2
  exit 1
}

warn() {
  echo "::warning::$1" >&2
}

check_files() {
  local root="$1"
  echo "Checking deployment files under ${root}..."

  for path in \
    ".next/BUILD_ID" \
    ".next/server" \
    "server.js" \
    "package.json" \
    "next.config.mjs" \
    "node_modules/next/package.json"
  do
    if [ ! -e "${root}/${path}" ]; then
      fail "Missing required file: ${path}"
    fi
  done

  if [ -L "${root}/node_modules" ]; then
    local target
    target="$(readlink "${root}/node_modules" || true)"
    fail "node_modules is a symlink (${target}). CI should ship a real directory — remove the symlink and redeploy."
  fi

  if [ -f "${root}/.env" ] && grep -qE '^NODE_ENV=' "${root}/.env"; then
    fail "Remove NODE_ENV from ${root}/.env — it breaks next build and causes /_global-error prerender failures. Next.js sets NODE_ENV automatically."
  fi

  echo "BUILD_ID=$(cat "${root}/.next/BUILD_ID")"
}

http_check() {
  local url="$1"
  local label="$2"
  local code body

  echo "HTTP check: ${label} (${url})"
  body="$(mktemp)"
  code="$(curl -sS -o "${body}" -w "%{http_code}" --max-time 30 -L "${url}" || echo "000")"

  if [ "${code}" = "000" ]; then
    rm -f "${body}"
    fail "${label} unreachable (curl failed)"
  fi

  echo "  status=${code}"
  head -c 300 "${body}" | tr '\n' ' '
  echo ""

  case "${code}" in
    200|301|302|307|308) ;;
    403)
      rm -f "${body}"
      fail "${label} returned 403 Forbidden. cPanel is serving Apache, not Passenger/Node. Fix: set Application root to ${DEPLOY_PATH}, startup file server.js, and map the domain to this Node app (not the parent public_html folder)."
      ;;
    502|503|504)
      rm -f "${body}"
      fail "${label} returned ${code}. Passenger/Node app may be down — check cPanel Node.js logs and tmp/restart.txt."
      ;;
    *)
      rm -f "${body}"
      fail "${label} returned unexpected HTTP ${code}"
      ;;
  esac

  rm -f "${body}"
}

case "${MODE}" in
  local)
    check_files "${DEPLOY_PATH}"
    ;;
  ci)
    check_files "."
    ;;
  remote)
    check_files "${DEPLOY_PATH}"
    http_check "${SITE_URL}/" "Site home"
    http_check "${SITE_URL}/ar" "Site /ar"
    http_check "${API_URL}/api/activities/ar?per_page=1" "Laravel API"
    ;;
  *)
    fail "Unknown mode: ${MODE} (use: local | ci | remote)"
    ;;
esac

echo "Deployment verification passed (${MODE})."
