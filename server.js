/**
 * Phusion Passenger / cPanel Node.js entry.
 * cPanel → Setup Node.js App → startup file = server.js, mode = Production.
 *
 * CloudLinux injects PhusionPassenger — listen on the passenger socket.
 * Do not duplicate Passenger* directives in .htaccess (cPanel owns that config).
 */
process.env.NODE_ENV = "production";

const fs = require("fs");
const path = require("path");
const http = require("http");
const next = require("next");
const { parse } = require("url");

function logBoot(msg, err) {
  const line = `[xoar-boot] ${new Date().toISOString()} ${msg}${err ? ` ${err && err.stack ? err.stack : err}` : ""}`;
  console.error(line);
  try {
    const dir = path.join(__dirname, "tmp");
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, "boot-error.log"), `${line}\n`);
  } catch (_) {
    /* ignore */
  }
}

if (typeof PhusionPassenger !== "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
}

const port = Number(process.env.PORT || 3000);
const app = next({ dev: false });
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
        console.log("next-server-ready passenger");
      });
      return;
    }

    // SSH / CI checks (no Passenger global): bind PORT only.
    server.listen(port, () => {
      console.log(`next-server-ready port=${port}`);
    });
  })
  .catch((err) => {
    logBoot("prepare-failed", err);
    process.exit(1);
  });
