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
  "/",
  inventoryFunctions.viewInventory
);

// Delete product route
employee_InventoryOperationRoutes.delete(
  "/:categoryId/:productId",
  inventoryFunctions.deleteProduct
);

// Update product route
employee_InventoryOperationRoutes.put(
  "/:categoryId/:productId",
  inventoryFunctions.updateProduct
);

// Restock a product
employee_InventoryOperationRoutes.patch(
  "/restock/:categoryId/:productId",
  inventoryFunctions.restockProduct
);

// Create product route
employee_InventoryOperationRoutes.post(
  "/:categoryId",
  inventoryFunctions.createProduct
);

// View inventory report route
employee_InventoryOperationRoutes.get(
  "/report",
  inventoryFunctions.getInventoryReport
);

module.exports = employee_InventoryOperationRoutes;
