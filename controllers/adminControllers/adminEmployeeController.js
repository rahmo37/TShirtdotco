// This file handles all the employee related operation employee has

// importing modules
const Employee = require("../../models/Employee");
const generateId = require("../../misc/generateId");
const { getHashedPassword } = require("../../misc/hashPassword");

// object that will accumulate all functions
const employeeFunctions = {};

employeeFunctions.viewEmployees = async (req, res, next) => {
  try {
    const fullEmployeeList = {};

    res.status(200).json({
      message: "Employee data included with corresponding orders handled",
      data: fullEmployeeList,
    });
  } catch (err) {
    return next(err);
  }
};


// Exporting the module
module.exports = employeeFunctions;