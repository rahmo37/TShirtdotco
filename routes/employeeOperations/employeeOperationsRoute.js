// Admin employee operations router

// Requiring express
const express = require("express");
const employee_EmployeeOperationRoutes = express.Router();
const employeeFunctions = require("../../controllers/employeeControllers/employee_EmployeeController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const { isAdmin } = require("../../middlewares/roleVerification");

// Register necessary middlewares to verify token and role
// TODO Uncomment token code later
//! employee_EmployeeOperationRoutes.use(jwtVerifyToken);

//view employee list route
employee_EmployeeOperationRoutes.get("/", employeeFunctions.viewEmployees);

//get an employee route
employee_EmployeeOperationRoutes.get(
  "/:employeeId",
  //! isAdmin,
  employeeFunctions.getAnEmployeeInfo
);

//close employee account route
employee_EmployeeOperationRoutes.patch(
  "/close/:employeeId",
  //! isAdmin,
  employeeFunctions.closeEmployeeAccount
);

//close employee account route
employee_EmployeeOperationRoutes.patch(
  "/reopen/:employeeId",
  //! isAdmin,
  employeeFunctions.reopenEmployeeAccount
);

//update employee account route
employee_EmployeeOperationRoutes.put(
  "/:employeeId",
  //! isAdmin,
  employeeFunctions.updateEmployee
);

//create employee account route
employee_EmployeeOperationRoutes.post(
  "/",
  //! isAdmin,
  employeeFunctions.createEmployee
);

// Exporting the module
module.exports = employee_EmployeeOperationRoutes;
