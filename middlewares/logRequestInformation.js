/**
 * This file logs request's information to the console, when the server receives a request from the client
 */

// importing modules
const colors = require("colors");
const { DateTime } = require("luxon");

const methodColors = {
  GET: "green",
  POST: "yellow",
  PUT: "blue",
  DELETE: "red",
  PATCH: "magenta",
};

const requestInfo = (req, res, next) => {
  // Using luxon module to create custom date format
  // setting the zone to new york
  const newYorkTime = DateTime.now().setZone("America/New_York");

  // formatting the date
  let formattedDate = `\nDate: ${newYorkTime.toFormat(
    "MM/dd/yyyy"
  )}\nTime: ${newYorkTime.toFormat("h:mm a")}`;

  // colorizing the requests
  const color = methodColors[req.method];

  // building the log message
  const logMessage = `(${req.method}) -> URL:${
    req.originalUrl
  } | Platform: ${req.get("User-Agent")} | Protocol: ${
    req.protocol
  } | \nRequest received at: ${formattedDate}`;

  // logging the message
  console.log(logMessage[color]);
  next();
};

module.exports = requestInfo;
