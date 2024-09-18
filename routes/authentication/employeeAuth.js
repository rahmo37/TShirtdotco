// Employee authentication router

// Requiring express
const express = require("express");
const employeeAuthRoute = express.Router();
const employeeController = require("../../controllers/employeeController");

employeeAuthRoute.post("/login");

module.exports = employeeAuthRoute;
