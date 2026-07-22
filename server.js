/**
 * Phusion Passenger entry (cPanel Node.js).
 * Set "Application startup file" to server.js in cPanel.
 * Application mode must be Production.
 *
 * cPanel may inject a non-standard NODE_ENV — force production before loading Next.
 */
process.env.NODE_ENV = "production";

const http = require("http");
const next = require("next");
const { parse } = require("url");

const port = Number(process.env.PORT || 3000);

const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    });

    // cPanel Node.js / Passenger sets PORT. Do not bind 0.0.0.0 (EADDRINUSE / startup fail).
    server.listen(port, () => {
      console.log(`next-server-ready port=${port}`);
    });

    server.on("error", (err) => {
      console.error("next-server-listen-failed", err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("next-server-failed", err);
    process.exit(1);
  });
