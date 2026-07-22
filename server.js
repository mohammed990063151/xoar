/**
 * cPanel Node.js / Passenger entry (loaded via app.js).
 * CloudLinux Node Selector sets PORT and proxies to it — bind PORT, not the passenger socket.
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

if (typeof PhusionPassenger !== "undefined") {
  // Required by Passenger even when binding PORT under CloudLinux Node Selector.
  PhusionPassenger.configure({ autoInstall: false });
}

const next = require("next");
const port = Number(process.env.PORT || 3000);
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

    // CloudLinux Node.js Selector expects a TCP listen on process.env.PORT.
    server.listen(port, () => {
      console.log(`next-server-ready port=${port} root=${root} passenger=${typeof PhusionPassenger !== "undefined"}`);
    });
  })
  .catch((err) => {
    logBoot("prepare-failed", err);
    process.exit(1);
  });
