/**
 * Author: Nick, Obaedur
 * Date: 17-sep-24
 * Description: This is the starting file of the ERPSystem, calls various routes and middlewares, connects to database and starts the server
 */

// Importing Modules
const express = require("express");
const mongoose = require("mongoose");
const customerAuth = require("./routes/auth/customerAuth");
const employeeAuth = require("./routes/auth/employeeAuth");
const errorHandler = require("./middlewares/errorHandler");
const dbConfig = require("./config/db");

// Creating application instance
const erpSystem = express();

// Data parsing middleware
erpSystem.use(express.json);

// Routes
// erpSystem.use("api/login/customer", customerAuth);
// erpSystem.use("api/login/employee", employeeAuth);

// Error handling middleware
// erpSystem.use(errorHandler);

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
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
