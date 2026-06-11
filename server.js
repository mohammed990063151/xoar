/**
 * Phusion Passenger entry (cPanel Node.js).
 * Set "Application startup file" to server.js in cPanel.
 */
const http = require("http");
const next = require("next");

const app = next({ dev: false });
const handle = app.getRequestHandler();

module.exports = app.prepare().then(() => {
  return (req, res) => handle(req, res);
});
