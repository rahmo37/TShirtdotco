// Admin inventory operations router

// Requiring express
const express = require("express");
const admin_InventoryOperationRoutes = express.Router();
const inventoryFunctions = require("../../controllers/adminControllers/adminInventoryController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const { isAdmin } = require("../../middlewares/roleVerification");

// Register necessary middlewares to  verify token and role
// TODO Uncomment token code later
// admin_InventoryOperationRoutes.use(jwtVerifyToken, isAdmin);

// View inventory route
admin_InventoryOperationRoutes.get(
  "/inventory",
  inventoryFunctions.viewInventory
);

// Delete product route
admin_InventoryOperationRoutes.delete(
  "/inventory/:categoryId/:productId",
  inventoryFunctions.deleteProduct
);

// Update product route
admin_InventoryOperationRoutes.put(
  "/inventory/:categoryId/:productId",
  inventoryFunctions.updateProduct
);

// Restock a product
admin_InventoryOperationRoutes.patch(
  "/inventory/restock/:categoryId/:productId",
  inventoryFunctions.restockProduct
);

// Create product route
admin_InventoryOperationRoutes.post(
  "/inventory/:categoryId",
  inventoryFunctions.createProduct
);

// View inventory report route
admin_InventoryOperationRoutes.get(
  "/inventory/report",
  inventoryFunctions.getInventoryReport
);

module.exports = admin_InventoryOperationRoutes;
