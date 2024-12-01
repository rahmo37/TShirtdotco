// This module helps in saving notification subscription and send notification using web-push

// Importing necessary modules
const bodyParser = require("body-parser");

const express = require("express");
const notification_configurationRoutes = express.Router();
const notificationConfigFunctions = require("../../controllers/notificationControllers/notificationConfigController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const { isEmployee } = require("../../middlewares/roleVerification");

// Registering body parser
notification_configurationRoutes.use(bodyParser.json());

notification_configurationRoutes.post(
  "/send-notification",
  notificationConfigFunctions.sendNotification
);

// Register necessary middlewares to  verify token and role
notification_configurationRoutes.use(jwtVerifyToken, isEmployee);

// This route is for saving the subscription
notification_configurationRoutes.post(
  "/save-subscription",
  notificationConfigFunctions.saveSubscription
);

notification_configurationRoutes.delete(
  "/remove-subscription",
  notificationConfigFunctions.removeSubscription
);

// This route is for sending notification
// notification_configurationRoutes.post("/send-notification");

module.exports = notification_configurationRoutes;
