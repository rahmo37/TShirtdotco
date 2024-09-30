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

// Delete product route
adminInventoryRoute.delete(
  "/inventory/:categoryId/:productId",
  inventoryFunctions.deleteProduct
);

// Update product route
adminInventoryRoute.put(
  "/inventory/:categoryId/:productId",
  inventoryFunctions.updateProduct
);

// Create product route
adminInventoryRoute.post(
  "/inventory/:categoryId",
  inventoryFunctions.createProduct
);

// View inventory report route
adminInventoryRoute.get(
  "/inventory/report",
  inventoryFunctions.getInventoryReport
);

module.exports = adminInventoryRoute;
