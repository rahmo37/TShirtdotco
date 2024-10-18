// customer order requests route

// Importing modules
const express = require("express");
const customer_orderRoutes = express.Router();
const orderFunctions = require("../../controllers/customerControllers/customerOrderController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");

// Verify token
// TODO uncomment later
// customer_orderRoutes.use(jwtVerifyToken);

customer_orderRoutes.get("/:customerId", orderFunctions.viewOrders);

module.exports = customer_orderRoutes;
