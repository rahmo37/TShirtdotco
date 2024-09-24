// Admin inventory operations router

// Requiring express
const express = require("express");
const adminInventoryRoute = express.Router();
const inventoryFunctions = require("../../controllers/adminInventoryController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const { isAdmin } = require("../../middlewares/roleVerification");

// Register necessary middlewares to  verify token and role
// adminInventoryRoute.use(jwtVerifyToken, isAdmin);

// View inventory route
adminInventoryRoute.get("/inventory", inventoryFunctions.viewInventory);

// Delete a product
adminInventoryRoute.delete(
  "/inventory/:categoryId/:productId",
  inventoryFunctions.deleteProduct
);

module.exports = adminInventoryRoute;
