/**
 * cPanel / CloudLinux Passenger entry (loaded by app.js).
 * Startup file in cPanel must be app.js.
 */
process.env.NODE_ENV = "production";

const fs = require("fs");
const path = require("path");
const http = require("http");
const { parse } = require("url");

// Passenger may start with a different cwd — pin to this app root.
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

    if (typeof PhusionPassenger !== "undefined") {
      server.listen("passenger", () => {
        console.log("next-server-ready passenger root=" + root);
      });
      return;
    }

    server.listen(port, () => {
      console.log(`next-server-ready port=${port} root=${root}`);
    });
  })
  .catch((err) => {
    logBoot("prepare-failed", err);
    process.exit(1);
  });
