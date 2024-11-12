// This router file creates a customer and is shared by all the entities, (customer and employee)

// Importing Modules
const express = require("express");
const sharedRoute = express.Router();
const createCustomer = require("../../controllers/sharedControllers/createCustomerController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");

// Register necessary middlewares to verify token
sharedRoute.use(jwtVerifyToken);

// Create a customer account
sharedRoute.post("/", createCustomer);

// Export the module
module.exports = sharedRoute;
