// Employee authentication router

// Requiring express
const express = require("express");
const employeeAuthRoute = express.Router();
const employeeController = require("../../controllers/authenticationControllers/employeeAuthController");

employeeAuthRoute.post("/", employeeController.login);

module.exports = employeeAuthRoute;
