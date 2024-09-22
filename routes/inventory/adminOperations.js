// Admin inventory operations router

// Requiring express
const express = require("express");
const adminInventoryRoute = express.Router();
const adminInventoryController = require("../../controllers/adminInventoryController");
const jwtVerifyToken = require("../../middlewares/jwtVerifyToken");
const { isAdmin } = require("../../middlewares/roleVerification");

// Register necessary middlewares to  verify token and role
adminInventoryRoute.use(jwtVerifyToken, isAdmin);

adminInventoryRoute.get("/inventory", (req, res, next) => {
  res.end(`Hello ${req.user.email}`);
});

// adminInventoryRoute.get("/inventory", adminInventoryController.login);

module.exports = adminInventoryRoute;
