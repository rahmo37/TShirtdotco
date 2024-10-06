// Admin employee operations router

// Requiring express
const express = require("express");
const admin_EmployeeOperationRoutes = express.Router();
const employeeFunctions = require("../../controllers/adminControllers/adminEmployeeController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const { isAdmin } = require("../../middlewares/roleVerification");

// Register necessary middlewares to verify token and role
// TODO Uncomment token code later
// adminInventoryRoute.use(jwtVerifyToken, isAdmin);

//view employee list route
admin_EmployeeOperationRoutes.get("/employee", employeeFunctions.viewEmployees);

// Exporting the module
module.exports = admin_EmployeeOperationRoutes;
