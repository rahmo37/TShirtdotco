// Admin employee operations router

// Requiring express
const express = require("express");
const admin_EmployeeOperationRoutes = express.Router();
const employeeFunctions = require("../../controllers/adminControllers/adminEmployeeController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const { isAdmin } = require("../../middlewares/roleVerification");

// Register necessary middlewares to verify token and role
// TODO Uncomment token code later
// admin_EmployeeOperationRoutes.use(jwtVerifyToken, isAdmin);

//view employee list route
admin_EmployeeOperationRoutes.get("/employee", employeeFunctions.viewEmployees);

//close employee account route
admin_EmployeeOperationRoutes.patch(
  "/employee/close/:employeeId",
  employeeFunctions.closeEmployeeAccount
);

//close employee account route
admin_EmployeeOperationRoutes.patch(
  "/employee/reopen/:employeeId",
  employeeFunctions.reopenEmployeeAccount
);

//update employee account route
admin_EmployeeOperationRoutes.put("/employee/:employeeId", employeeFunctions.updateEmployee);

// Exporting the module
module.exports = admin_EmployeeOperationRoutes;
