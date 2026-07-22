/**
 * cPanel Node.js / Passenger entry (loaded via app.js).
 * Confirmed via passenger.log env dump: Passenger spawns this app with
 * PASSENGER_USE_FEEDBACK_FD=true / IN_PASSENGER=1 and no PORT at all — this is
 * classic Phusion Passenger native Node integration, which expects
 * server.listen("passenger"), not a numeric TCP port. Falls back to PORT/3000
 * only when running standalone outside Passenger (local/manual testing).
 */
process.env.NODE_ENV = "production";

const fs = require("fs");
const path = require("path");
const http = require("http");
const { parse } = require("url");

const root = __dirname;
try {
  process.chdir(root);
} catch (_) {
  /* ignore */
}

function logBoot(msg, err) {
  const line = `[xoar-boot] ${new Date().toISOString()} ${msg}${err ? ` ${err && err.stack ? err.stack : err}` : ""}`;
  console.error(line);
  try {
    const dir = path.join(root, "tmp");
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, "boot-error.log"), `${line}\n`);
  } catch (_) {
    /* ignore */
  }
}

const isPassenger = typeof PhusionPassenger !== "undefined";

if (isPassenger) {
  PhusionPassenger.configure({ autoInstall: false });
}

const next = require("next");
const port = Number(process.env.PORT || 3000);
const listenTarget = isPassenger ? "passenger" : port;
const app = next({ dev: false, dir: root });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    });

    server.on("error", (err) => {
      logBoot("listen-failed", err);
      process.exit(1);
    });

    // Under Passenger: bind its feedback-FD socket ("passenger"), not a TCP port.
    // Standalone (local/manual testing): bind the numeric PORT/3000 fallback.
    server.listen(listenTarget, () => {
      console.log(`next-server-ready target=${listenTarget} root=${root} passenger=${isPassenger}`);
    });
  })
  .catch((err) => {
    logBoot("prepare-failed", err);
    process.exit(1);
  });
