// Employee inventory operations router

// Importing Modules
const express = require("express");
const employee_OrderOperationRoutes = express.Router();
const orderFunctions = require("../../controllers/employeeControllers/employeeOrderController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");

// Register necessary middlewares to verify token and role
// TODO Uncomment token code later
// ! employee_OrderOperationRoutes.use(jwtVerifyToken);

// view all orders route
employee_OrderOperationRoutes.get("/", orderFunctions.viewOrders);

// change order status
employee_OrderOperationRoutes.patch(
  "/status/:orderId",
  orderFunctions.changeOrderStatus
);

// add discount
employee_OrderOperationRoutes.patch(
  "/discount/:orderId",
  orderFunctions.addDiscount
);

// cancel an order
employee_OrderOperationRoutes.patch(
  "/cancel/:orderId",
  orderFunctions.cancelAnOrder
);

employee_OrderOperationRoutes.patch(
  "/item/:orderId",
  orderFunctions.removeAnItemFromTheOrder
);

// export the module
module.exports = employee_OrderOperationRoutes;
