// Customer authentication router

// Requiring express
const express = require("express");
const customerAuthRoute = express.Router();
const customerController = require("../../controllers/authenticationControllers/customerAuthController");

customerAuthRoute.post("/login", customerController.login);

module.exports = customerAuthRoute;
