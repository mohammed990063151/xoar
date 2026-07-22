/**
 * Phusion Passenger entry (cPanel Node.js).
 * Set "Application startup file" to server.js in cPanel.
 * Application mode must be Production.
 *
 * Under Apache mod_passenger, the process must listen on the Passenger socket.
 * Binding 0.0.0.0/PORT makes Passenger report: "Web application could not be started".
 */
process.env.NODE_ENV = "production";

if (typeof PhusionPassenger !== "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
}

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

    server.on("error", (err) => {
      console.error("next-server-listen-failed", err);
      process.exit(1);
    });

    if (typeof PhusionPassenger !== "undefined") {
      server.listen("passenger", () => {
        console.log("next-server-ready passenger");
      });
      return;
    }

    // Local / CI boot checks (no PhusionPassenger global).
    server.listen(port, "127.0.0.1", () => {
      console.log(`next-server-ready port=${port}`);
    });
  })
  .catch((err) => {
    console.error("next-server-failed", err);
    process.exit(1);
  });
