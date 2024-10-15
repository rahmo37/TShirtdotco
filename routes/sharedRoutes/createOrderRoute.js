// This router file creates an order and is shared by all the entities, (customer and employee)

// Importing Modules
const express = require("express");
const sharedRoute = express.Router();
const createOrder = require("../../controllers/sharedControllers/createOrderController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");

// Register necessary middlewares to verify token
//! sharedRoute.use(jwtVerifyToken);

// Create a customer account
sharedRoute.post("/", createOrder);

// Export the module
module.exports = sharedRoute;
