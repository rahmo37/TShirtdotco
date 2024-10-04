/**
 * This file logs request's information to the console, when the server receives a request from the client
 */

// importing modules
const colors = require("colors");

const methodColors = {
  GET: "green",
  POST: "yellow",
  PUT: "blue",
  DELETE: "red",
  PATCH:"magenta"
};

const requestInfo = (req, res, next) => {
  const color = methodColors[req.method];
  const logMessage = `(${req.method}) URL:${
    req.originalUrl
  } - Platform: ${req.get("User-Agent")} - Protocol: ${
    req.protocol
  } - Request received at: ${new Date().toISOString()}`;
  console.log(logMessage[color]);
  next();
};

module.exports = requestInfo;
