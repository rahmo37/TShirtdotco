// This file handles all the employee related operation employee has

// importing modules
const Employee = require("../../models/Employee");
const generateId = require("../../misc/generateId");
const { getHashedPassword } = require("../../misc/hashPassword");
const dynamicObjectUpdate = require("../../misc/dynamicObjectUpdate");

// object that will accumulate all functions
const employeeFunctions = {};

// view all the employees and their corresponding orders - function
employeeFunctions.viewEmployees = async (req, res, next) => {
  try {
    const fullEmployeeList = await Employee.aggregate([
      {
        $project: {
          _id: 0,
          password: 0,
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "employeeID",
          foreignField: "placedBy",
          as: "orders",
        },
      },
    ]);

    res.status(200).json({
      message: "Employee data included with corresponding orders handled",
      data: fullEmployeeList,
    });
  } catch (err) {
    return next(err);
  }
};

// get an employee function - function
employeeFunctions.getAnEmployeeInfo = async (req, res, next) => {
  try {
    // get the employeeId from the request parameter
    const { employeeId } = req.params;

    // retrieve the employee
    const employeeData = await Employee.findOne({
      employeeID: employeeId,
    });

    // see if the employee exists or not
    if (!employeeData) {
      const err = new Error(
        "Request cannot be completed, because there is no employee exists with the employeeId provided"
      );
      err.status = 400;
      return next(err);
    }

    res.status(200).json({
      message: "Employee data included",
      data: {
        employeeData,
      },
    });
  } catch (err) {
    next(err);
  }
};

// close a employee account - function
employeeFunctions.closeEmployeeAccount = async (req, res, next) => {
  try {
    // get the employeeId from the request parameters
    const { employeeId } = req.params;

    // find the employee
    const employeeData = await Employee.findOne({
      employeeID: employeeId,
    });

    if (!employeeData) {
      const err = new Error(
        "Request cannot be completed, because there is no employee exists with the employeeId provided"
      );
      err.status = 404;
      return next(err);
    }

    if (employeeData.accountStatus === "Closed") {
      const err = new Error("This account is already closed");
      err.status = 400;
      return next(err);
    }

    // Set the account status to closed
    employeeData.accountStatus = "Closed";

    // Then save the change
    await employeeData.save();

    res.status(200).json({
      message: "Account closed",
      data: {
        employeeData,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// reopen a employee account - function
employeeFunctions.reopenEmployeeAccount = async (req, res, next) => {
  try {
    // get the employeeId from the request parameters
    const { employeeId } = req.params;

    // find the employee
    const employeeData = await Employee.findOne({
      employeeID: employeeId,
    });

    if (!employeeData) {
      const err = new Error(
        "Request cannot be completed, because there is no employee exists with the employeeId provided"
      );
      err.status = 404;
      return next(err);
    }

    if (employeeData.accountStatus === "Active") {
      const err = new Error("This account is already active");
      err.status = 400;
      return next(err);
    }

    // Set the account status to active
    employeeData.accountStatus = "Active";

    // Then save the change
    await employeeData.save();

    res.status(200).json({
      message: "This account is now reopened",
      data: {
        employeeData,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// update a customer - function
employeeFunctions.updateEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const revisedEmployee = req.body;
    const userId = req.user.id;

    // checking if the updated date is provided
    if (!revisedEmployee || Object.keys(revisedEmployee).length === 0) {
      const err = new Error("You must provide employee details to update");
      err.status = 400;
      return next(err);
    }

    if (userId === employeeId) {
      const err = new Error(
        "You cannot update your own profile through this portal. Please use the settings section to make changes."
      );
      err.status = 403;
      return next(err);
    }

    // Find the employee
    let employeeData = await Employee.findOne({
      employeeID: employeeId, // Query to find the employee by employeeID
    });

    // If not found
    if (!employeeData) {
      const err = new Error(
        "The request cannot be completed, unable to find any employee with the provided employeeID"
      );
      err.status = 404;
      return next(err);
    }

    // if the employee, being updated is an Admin,
    if (employeeData.isAdmin) {
      const err = new Error(
        "You don't have the necessary permissions to complete this action"
      );
      err.status = 403;
      return next(err);
    }

    // update the employee
    Object.assign(
      employeeData,
      dynamicObjectUpdate(employeeData.toObject(), revisedEmployee)
    );

    // save the employee
    await employeeData.save();

    res.status(200).json({
      message: "Employee updated successfully",
      data: {
        ...employeeData.toObject(), // casting to mongoose object which will remove the password
      },
    });
  } catch (err) {
    return next(err);
  }
};

// create an employee - function
employeeFunctions.createEmployee = async (req, res, next) => {
  try {
    // retrieving the new employee data
    const employeeData = req.body;

    // if employee data is not provided
    if (Object.keys(employeeData).length == 0) {
      const err = new Error(
        "The request cannot be processed without providing the new employee's information"
      );
      err.status = 400;
      return next(err);
    }

    // checking for password
    if (!employeeData.password) {
      const err = new Error("Password is required to create an employee");
      err.status = 400;
      return next(err);
    }

    // checking for email
    if (!employeeData.email) {
      const err = new Error("Email is required to create an employee");
      err.status = 400;
      return next(err);
    }

    // checking for phone number
    if (!employeeData.phone) {
      const err = new Error("Phone number is required to create a employee");
      err.status = 400;
      return next(err);
    }

    // retrieving the employee
    const email = await Employee.findOne({
      email: employeeData.email,
    });

    // checking if a employee with that email already exists
    if (email) {
      const err = new Error("An employee with this email already exists");
      err.status = 400;
      return next(err);
    }

    // retrieving phone
    const phone = await Employee.findOne({
      phone: employeeData.phone,
    });

    // checking if a employee with that email already exists
    if (phone) {
      const err = new Error(
        "An employee with this phone number already exists"
      );
      err.status = 400;
      return next(err);
    }

    // hashing the employee's password
    const hashedPassword = await getHashedPassword(employeeData.password);

    // generating an id for the employee
    const employeeId = generateId("EMP_");

    // get the current date and time for account created variable
    const accountCreated = new Date();

    // add the above properties to the employee
    employeeData.password = hashedPassword;
    employeeData.employeeID = employeeId;
    employeeData.accountCreated = accountCreated;
    employeeData.lastLogin = null;

    // create new employee
    await new Employee(employeeData).save();

    // delete the password
    delete employeeData.password;

    // Send response
    return res.status(201).json({
      message: "New employee created",
      data: { employeeData },
    });
  } catch (err) {
    next(err);
  }
};

// Exporting the module
module.exports = employeeFunctions;
