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
  code="$(curl -sS -o "${body}" -w "%{http_code}" --max-time 45 -L \
    -A "xoar-deploy-check/1.0" \
    "${url}" 2>/dev/null || echo "000")"

  echo "  status=${code}" >&2
  head -c 280 "${body}" | tr '\n' ' ' >&2
  echo "" >&2

  if [ "${code}" != "000" ] && [ -f "${body}" ]; then
    if grep -qi 'Web application could not be started' "${body}" 2>/dev/null; then
      echo "  Passenger failed to start Node app" >&2
      code="passenger"
    elif ! http_check_ok "${code}"; then
      if grep -q '__next_error__' "${body}" 2>/dev/null; then
        echo "  error response contains __next_error__" >&2
        code="err"
      fi
    elif [ -s "${body}" ] && ! grep -qiE '<(html|!DOCTYPE)' "${body}" 2>/dev/null; then
      echo "  200 response missing HTML document" >&2
      code="err"
    fi
  fi

  rm -f "${body}"
  echo "${code}"
}

http_check_ok() {
  local code="$1"
  case "${code}" in
    200|301|302|307|308) return 0 ;;
    err|passenger|000) return 1 ;;
    *) return 1 ;;
  esac
}

http_check_optional() {
  local url="$1"
  local label="$2"
  local code
  code="$(http_fetch "${url}" "${label}")"

  if [ "${code}" = "000" ] || [ "${code}" = "err" ] || [ "${code}" = "passenger" ] || ! http_check_ok "${code}"; then
    warn "${label} check did not pass (HTTP ${code}) — deploy not blocked."
    return 0
  fi
}

# Try several routes each attempt — /ar (SSR) can be slow; lighter pages prove the app is up.
http_checks() {
  local routes=(
    "/en/contact"
    "/ar/about"
    "/ar/events"
    "/ar"
  )
  local attempt route url code verified=""

  for attempt in 1 2 3 4 5; do
    echo "Health check round ${attempt}/5 ..." >&2
    for route in "${routes[@]}"; do
      url="${SITE_URL}${route}"
      code="$(http_fetch "${url}" "${route} (round ${attempt})")"
      if http_check_ok "${code}"; then
        verified="${route}"
        break 2
      fi
    done

    if [ "${attempt}" -lt 5 ]; then
      echo "  no route OK yet, waiting 8s ..." >&2
      sleep 8
    fi
  done

  if [ -z "${verified}" ]; then
    fail "Site health check failed after 5 rounds. None of: ${routes[*]}"
  fi

  echo "Site is up (verified via ${verified})." >&2
  http_check_optional "${SITE_URL}/" "Site home"
  http_check_optional "${SITE_URL}/api/activities/ar?per_page=1" "Next.js API proxy"
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
