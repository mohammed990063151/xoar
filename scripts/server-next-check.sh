#!/usr/bin/env bash
# Verify Next.js can prepare and server.js can boot on the server Node (Passenger).
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH is required}"
cd "${DEPLOY_PATH}"

if [ ! -f .next/BUILD_ID ]; then
  echo "::error::Missing .next/BUILD_ID on server"
  exit 1
fi

if [ ! -f server.js ]; then
  echo "::error::Missing server.js on server"
  exit 1
fi

if [ -f .env ] && grep -qE '^NODE_ENV=' .env; then
  echo "::error::Remove NODE_ENV from server .env"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="$("${SCRIPT_DIR}/resolve-server-node.sh")"

echo "Using node: ${NODE_BIN} ($("${NODE_BIN}" -v))"
echo "Running next.prepare() (BUILD_ID=$(cat .next/BUILD_ID)) ..."

NODE_ENV=production timeout 120 "${NODE_BIN}" <<'NODE'
const next = require("next");
const app = next({ dev: false });
app
  .prepare()
  .then(() => {
    console.log("next-prepare-ok");
    process.exit(0);
  })
  .catch((err) => {
    console.error("next-prepare-failed", err);
    process.exit(1);
  });
NODE

echo "Running server.js boot check (local TCP) ..."

NODE_ENV=production timeout 120 "${NODE_BIN}" <<'NODE'
const http = require("http");
const next = require("next");
const { parse } = require("url");

const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    });
    server.listen(0, "127.0.0.1", () => {
      console.log("server-boot-ok");
      server.close(() => process.exit(0));
    });
    server.on("error", (err) => {
      console.error("server-boot-failed", err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("server-boot-failed", err);
    process.exit(1);
  });
NODE
