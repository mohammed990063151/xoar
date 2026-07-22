/**
 * Phusion Passenger entry (cPanel Node.js).
 * Set "Application startup file" to server.js in cPanel.
 * Application mode must be Production.
 *
 * cPanel sometimes injects a non-standard NODE_ENV (not development|production|test).
 * Next.js then fails under Passenger even though CI checks (which force production) pass.
 */
process.env.NODE_ENV = "production";

const http = require("http");
const next = require("next");
const { parse } = require("url");

const port = Number(process.env.PORT || 3000);

const app = next({ dev: false });
const handle = app.getRequestHandler();

function startServer() {
  const server = http.createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  // Prefer Passenger socket when available; fall back to PORT for local/CI checks.
  if (typeof PhusionPassenger !== "undefined") {
    server.listen("passenger", () => {
      console.log("next-server-ready passenger");
    });
    return;
  }

  server.listen(port, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log(`next-server-ready port=${port}`);
  });
}

app
  .prepare()
  .then(startServer)
  .catch((err) => {
    console.error("next-server-failed", err);
    process.exit(1);
  });
