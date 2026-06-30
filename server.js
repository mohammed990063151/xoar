/**
 * Phusion Passenger entry (cPanel Node.js).
 * Set "Application startup file" to server.js in cPanel.
 * Application mode must be Production.
 */
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

  // cPanel Passenger injects PhusionPassenger — must not bind 0.0.0.0 manually.
  if (typeof PhusionPassenger !== "undefined") {
    server.listen("passenger", () => {
      console.log("next-server-ready passenger");
    });
    return;
  }

  server.listen(port, "0.0.0.0", () => {
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
