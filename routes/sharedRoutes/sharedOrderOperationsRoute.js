// This router file creates an order and is shared by all the entities, (customer and employee)

// Importing Modules
const express = require("express");
const sharedRoute = express.Router();
const sharedOrderFunctions = require("../../controllers/sharedControllers/sharedOrderOperationsController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");

// Register necessary middlewares to verify token
sharedRoute.use(jwtVerifyToken);

// Create a customer account
sharedRoute.post("/", sharedOrderFunctions.createOrder);

// Cancel an order
sharedRoute.patch("/cancel/:orderId", sharedOrderFunctions.cancelAnOrder);

// Remove an item from the order
sharedRoute.patch(
  "/item/:orderId",
  sharedOrderFunctions.removeAnItemFromTheOrder
);

// Export the module
module.exports = sharedRoute;
