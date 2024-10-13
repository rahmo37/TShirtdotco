// Employee customer operations router

// Requiring express
const express = require("express");
const employee_CustomerOperationRoutes = express.Router();
const customerFunctions = require("../../controllers/employeeControllers/employeeCustomerController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const { isAdmin } = require("../../middlewares/roleVerification");

// Register necessary middlewares to  verify token and role
// TODO Uncomment token code later
//! employee_CustomerOperationRoutes.use(jwtVerifyToken);

// view customer list route
employee_CustomerOperationRoutes.get("/customer", customerFunctions.viewCustomers);

// get a customer account
employee_CustomerOperationRoutes.get(
  "/customer/:customerId",
  customerFunctions.getACustomerInfo
);

// freeze a customer account route
employee_CustomerOperationRoutes.patch(
  "/customer/freeze/:customerId", 
  //! isAdmin,
  customerFunctions.freezeCustomerAccount
);

// unfreeze a customer account route
employee_CustomerOperationRoutes.patch(
  "/customer/unfreeze/:customerId",
  //! isAdmin,
  customerFunctions.unFreezeCustomerAccount
);

// update a customer account
employee_CustomerOperationRoutes.put(
  "/customer/:customerId",
  customerFunctions.updateCustomer
);

// create a customer account
employee_CustomerOperationRoutes.post(
  "/customer",
  customerFunctions.createCustomer
);

// export the module
module.exports = employee_CustomerOperationRoutes;
