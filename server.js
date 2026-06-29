/**
 * Phusion Passenger entry (cPanel Node.js).
 * Set "Application startup file" to server.js in cPanel.
 * Application mode must be Production.
 */
const http = require("http");
const next = require("next");
const { parse } = require("url");

const port = Number(process.env.PORT || 3000);

// Always production on the server — never run Next dev mode behind Passenger.
const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        handle(req, res, parse(req.url, true));
      })
      .listen(port, () => {
        console.log(`next-server-ready port=${port}`);
      });
  })
  .catch((err) => {
    console.error("next-server-failed", err);
    process.exit(1);
  });
