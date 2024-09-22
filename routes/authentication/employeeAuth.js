// Employee authentication router

// Requiring express
const express = require("express");
const employeeAuthRoute = express.Router();
const employeeController = require("../../controllers/employeeAuthController");

employeeAuthRoute.post("/login", employeeController.login);

module.exports = employeeAuthRoute;
