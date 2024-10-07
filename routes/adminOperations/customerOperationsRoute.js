// Admin customer operations router

// Requiring express
const express = require("express");
const admin_CustomerOperationRoutes = express.Router();
const customerFunctions = require("../../controllers/adminControllers/adminCustomerController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const { isAdmin } = require("../../middlewares/roleVerification");

// Register necessary middlewares to  verify token and role
// TODO Uncomment token code later
// admin_CustomerOperationRoutes.use(jwtVerifyToken, isAdmin);

// view customer list route
admin_CustomerOperationRoutes.get("/customer", customerFunctions.viewCustomers);

// freeze a customer account route
admin_CustomerOperationRoutes.patch(
  "/customer/freeze/:customerId",
  customerFunctions.freezeCustomerAccount
);

// unfreeze a customer account route
admin_CustomerOperationRoutes.patch(
  "/customer/unfreeze/:customerId",
  customerFunctions.unFreezeCustomerAccount
);

// update a customer account
admin_CustomerOperationRoutes.put(
  "/customer/:customerId",
  customerFunctions.updateCustomer
);

// create a customer account
admin_CustomerOperationRoutes.post(
  "/customer",
  customerFunctions.createCustomer
);

// export the module
module.exports = admin_CustomerOperationRoutes;
