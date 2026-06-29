/**
 * Phusion Passenger entry (cPanel Node.js).
 * Set "Application startup file" to server.js in cPanel.
 */
const http = require("http");
const next = require("next");
const { parse } = require("url");

const port = Number(process.env.PORT || 3000);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

// Passenger expects the app to bind to process.env.PORT.
app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      })
      .listen(port, "0.0.0.0", (err) => {
        if (err) throw err;
        // Keep a stable log line for debugging in shared hosting.
        console.log(`next-server-ready port=${port} env=${process.env.NODE_ENV || ""}`);
      });
  })
  .catch((err) => {
    console.error("next-server-failed", err);
    process.exit(1);
  });
