// This module updates the customer information

// Importing modules
const express = require("express");
const customer_InfoUpdateRoutes = express.Router();
const customerUpdateFunctions = require("../../controllers/updateAccountInformationController/customerInfoUpdateController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const idVerify = require("../../middlewares/idVerification");

// Register necessary middlewares to verify token
customer_InfoUpdateRoutes.use(jwtVerifyToken);

// Update customer info route
customer_InfoUpdateRoutes.patch(
  "/generalInfo/:id",
  idVerify,
  customerUpdateFunctions.updateGeneralInfo
);

// Update customer info route
customer_InfoUpdateRoutes.patch(
  "/password/:id",
  idVerify,
  customerUpdateFunctions.changePassword
);


// Export the module
module.exports = customer_InfoUpdateRoutes;
