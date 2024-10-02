// Admin customer operations router

// Requiring express
const express = require("express");
const admin_CustomerOperationRoutes = express.Router();
const inventoryFunctions = require("../../controllers/adminControllers/adminCustomerController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const { isAdmin } = require("../../middlewares/roleVerification");

// Register necessary middlewares to  verify token and role
// TODO Uncomment token code later
// adminInventoryRoute.use(jwtVerifyToken, isAdmin);
