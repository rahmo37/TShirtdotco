// Retrieving the inventory, route

// Importing Modules
const express = require("express");
const sharedRoute = express.Router();
const currentInventory = require("../../controllers/sharedControllers/getInventoryController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");

// Register necessary middlewares to verify token
//! sharedRoute.use(jwtVerifyToken);

// Create a customer account
sharedRoute.get("/", currentInventory);

// Export the module
module.exports = sharedRoute;
