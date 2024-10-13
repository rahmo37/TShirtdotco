// Employee inventory operations router

// Requiring express
const express = require("express");
const employee_InventoryOperationRoutes = express.Router();
const inventoryFunctions = require("../../controllers/employeeControllers/employeeInventoryController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");

// Register necessary middlewares to  verify token and role
// TODO Uncomment token code later
// ! employee_InventoryOperationRoutes.use(jwtVerifyToken);

// View inventory route
employee_InventoryOperationRoutes.get(
  "/inventory",
  inventoryFunctions.viewInventory
);

// Delete product route
employee_InventoryOperationRoutes.delete(
  "/inventory/:categoryId/:productId",
  inventoryFunctions.deleteProduct
);

// Update product route
employee_InventoryOperationRoutes.put(
  "/inventory/:categoryId/:productId",
  inventoryFunctions.updateProduct
);

// Restock a product
employee_InventoryOperationRoutes.patch(
  "/inventory/restock/:categoryId/:productId",
  inventoryFunctions.restockProduct
);

// Create product route
employee_InventoryOperationRoutes.post(
  "/inventory/:categoryId",
  inventoryFunctions.createProduct
);

// View inventory report route
employee_InventoryOperationRoutes.get(
  "/inventory/report",
  inventoryFunctions.getInventoryReport
);

module.exports = employee_InventoryOperationRoutes;
