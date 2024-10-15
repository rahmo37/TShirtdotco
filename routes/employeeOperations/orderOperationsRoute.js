// Employee inventory operations router

// Importing Modules
const express = require("express");
const employee_OrderOperationRoutes = express.Router();
const orderFunctions = require("../../controllers/employeeControllers/employeeOrderController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");

// Register necessary middlewares to verify token and role
// TODO Uncomment token code later
// ! employee_OrderOperationRoutes.use(jwtVerifyToken);

// view all orders - function
employee_OrderOperationRoutes.get("/", orderFunctions.viewOrders);

// export the module
module.exports = employee_OrderOperationRoutes;
