/**
 * Author: Nick, Obaedur
 * Date: 17-sep-24
 * Description: This is the starting file of the ERPSystem, calls various routes and middlewares, connects to database and starts the server
 */

// Importing Modules
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const customerAuth = require("./routes/authentication/customerAuth");
const employeeAuth = require("./routes/authentication/employeeAuth");
const adminInventoryOperations = require("./routes/adminOperations/inventoryOperationsRoute");
const adminCustomerOperations = require("./routes/adminOperations/customerOperationsRoute");
const adminEmployeeOperations = require("./routes/adminOperations/employeeOperationsRoute");
const employeeInformationUpdate = require("./routes/updateAccountInformation/employeeInfoUpdateRoute");
const customerInformationUpdate = require("./routes/updateAccountInformation/customerInfoUpdateRoute");
const errorHandler = require("./middlewares/errorHandler");
const routeNotFoundHandler = require("./middlewares/routeNotFoundHandler");
const requestInfo = require("./middlewares/logRequestInformation");
const Customer = require("./models/Customer");
const Employee = require("./models/Employee");
const dbConfig = require("./config/db");
const { hashPasswordsInDatabase } = require("./misc/hashPassword");

// Creating application instance
const erpSystem = express();

// Enable cors-origin requests
erpSystem.use(cors());

// Print request information
erpSystem.use(requestInfo);

// Data parsing middleware
erpSystem.use(express.json());

// Routes
erpSystem.use("/api/customer", customerAuth);
erpSystem.use("/api/customer", customerInformationUpdate);
erpSystem.use("/api/employee", employeeAuth);
erpSystem.use("/api/admin", adminInventoryOperations);
erpSystem.use("/api/admin", adminCustomerOperations);
erpSystem.use("/api/admin", adminEmployeeOperations);
erpSystem.use("/api/employee", employeeInformationUpdate);

// Not found error handler, if no routes matches this middleware is called
erpSystem.use(routeNotFoundHandler);

// Error handling middleware
erpSystem.use(errorHandler);

// Database connection
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Database connected...");

    /**
     * If database connection is successful, we start our server
     * Otherwise we go to the catch block
     */
    const PORT = process.env.PORT || 3000;
    erpSystem.listen(PORT, () => {
      console.log(`ERP Server is listening request on port ${PORT}...`);
    });

    // Hash entity passwords
    hashPasswordsInDatabase([Customer, Employee]);
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
