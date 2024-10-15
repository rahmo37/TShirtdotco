// This module updates the employee information

// Importing modules
const express = require("express");
const employee_InfoUpdateRoutes = express.Router();
const employeeUpdateFunctions = require("../../controllers/updateAccountInformationController/employeeInfoUpdateController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const idVerify = require("../../middlewares/idVerification");

// Register necessary middlewares to verify token
employee_InfoUpdateRoutes.use(jwtVerifyToken);

// Update employee info route
employee_InfoUpdateRoutes.patch(
  "/generalInfo/:id",
  idVerify,
  employeeUpdateFunctions.updateGeneralInfo
);

// Change password route
employee_InfoUpdateRoutes.patch(
  "/password/:id",
  idVerify,
  employeeUpdateFunctions.changePassword
);


// Export the module
module.exports = employee_InfoUpdateRoutes;
