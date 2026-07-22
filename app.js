/**
 * cPanel PassengerStartupFile — keep identical boot path to server.js.
 * (Some Passenger builds resolve relative requires poorly; inline require is enough.)
 */
module.exports = require("./server.js");
