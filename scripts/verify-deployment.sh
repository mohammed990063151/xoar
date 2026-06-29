#!/usr/bin/env bash
# Post-deploy checks — run in CI after rsync or manually on the server.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/home/cjfyc2evye0k/public_html/xoraevents.com/xoar}"
SITE_URL="${SITE_URL:-https://xoraevents.com}"
API_URL="${API_URL:-https://xoraplus.com}"
MODE="${MODE:-${1:-local}}" # local | ci | http

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

http_fetch() {
  local url="$1"
  local label="$2"
  local body code

  echo "HTTP check: ${label} (${url})" >&2
  body="$(mktemp)"
  code="$(curl -sS -o "${body}" -w "%{http_code}" --max-time 30 -L "${url}" || echo "000")"

  echo "  status=${code}" >&2
  head -c 300 "${body}" | tr '\n' ' ' >&2
  echo "" >&2

  rm -f "${body}"
  echo "${code}"
}

http_check_ok() {
  local code="$1"
  case "${code}" in
    200|301|302|307|308) return 0 ;;
    *) return 1 ;;
  esac
}

http_check_required() {
  local url="$1"
  local label="$2"
  local code
  code="$(http_fetch "${url}" "${label}")"

  if [ "${code}" = "000" ]; then
    fail "${label} unreachable (curl failed)"
  fi

  if http_check_ok "${code}"; then
    return 0
  fi

  case "${code}" in
    500)
      fail "${label} returned 500. Passenger started but the Node app crashed. Check cPanel Node.js logs and restart the app."
      ;;
    403)
      fail "${label} returned 403. cPanel is serving Apache, not Passenger/Node. Fix Application root → ${DEPLOY_PATH}, startup file server.js."
      ;;
    502|503|504)
      fail "${label} returned ${code}. Passenger/Node app may be down."
      ;;
    *)
      fail "${label} returned unexpected HTTP ${code}"
      ;;
  esac
}

http_check_optional() {
  local url="$1"
  local label="$2"
  local code
  code="$(http_fetch "${url}" "${label}")"

  if [ "${code}" = "000" ] || ! http_check_ok "${code}"; then
    warn "${label} check did not pass (HTTP ${code}) — deploy not blocked."
    return 0
  fi
}

http_checks() {
  # Only /ar is required — this is the real public entrypoint.
  http_check_required "${SITE_URL}/ar" "Site /ar"
  http_check_optional "${SITE_URL}/" "Site home"
  http_check_optional "${API_URL}/api/activities/ar?per_page=1" "Laravel API"
}

case "${MODE}" in
  local)
    check_files "${DEPLOY_PATH}"
    ;;
  ci)
    check_files "."
    ;;
  http|remote)
    http_checks
    ;;
  *)
    fail "Unknown mode: ${MODE} (use: local | ci | http | remote)"
    ;;
esac

echo "Deployment verification passed (${MODE})."
