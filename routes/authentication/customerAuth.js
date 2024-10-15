// Customer authentication router

// Importing modules
const express = require("express");
const customerAuthRoute = express.Router();
const customerController = require("../../controllers/authenticationControllers/customerAuthController");

customerAuthRoute.post("/", customerController.login);

module.exports = customerAuthRoute;
