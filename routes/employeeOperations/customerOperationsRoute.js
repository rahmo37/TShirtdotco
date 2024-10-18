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
employee_CustomerOperationRoutes.get("/", customerFunctions.viewCustomers);

// get a customer account
employee_CustomerOperationRoutes.get(
  "/:customerId",
  customerFunctions.getACustomerInfo
);

// freeze a customer account route
employee_CustomerOperationRoutes.patch(
  "/freeze/:customerId", 
  //! isAdmin,
  customerFunctions.freezeCustomerAccount
);

// unfreeze a customer account route
employee_CustomerOperationRoutes.patch(
  "/unfreeze/:customerId",
  //! isAdmin,
  customerFunctions.unFreezeCustomerAccount
);

// update a customer account
employee_CustomerOperationRoutes.put(
  "/:customerId",
  customerFunctions.updateCustomer
);

//! This routes is currently shared in the shared routes folder
// create a customer account
// employee_CustomerOperationRoutes.post(
//   "/",
//   customerFunctions.createCustomer
// );

// Export the module
module.exports = employee_CustomerOperationRoutes;
