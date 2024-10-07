// This file handles all the employee related operation employee has

// importing modules
const Employee = require("../../models/Employee");
const generateId = require("../../misc/generateId");
const { getHashedPassword } = require("../../misc/hashPassword");

// object that will accumulate all functions
const employeeFunctions = {};

// view all the employees and their corresponding
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

// close a employee account
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

// reopen a employee account
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

employeeFunctions.updateEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const revisedEmployee = req.body;
    const userId = req.user.id;

    // checking if the updated date is provided
    if (!revisedEmployee) {
      const err = new Error("You must provide employee details to update");
      err.status = 400;
      return next(err);
    }

    // TODO activate it later
    //! if (userId === employeeId) {
    //   const err = new Error(
    //     "You cannot update your own profile through this portal. Please use the user profile section to make changes."
    //   );
    //   err.status = 403;
    //   return next(err);
    //! }

    // add the employeeId back to the employee details
    revisedEmployee.employeeID = employeeId;

    let employeeData = await Employee.findOne({
      employeeID: employeeId, // Query to find the employee by employeeID
    });

    if (!employeeData) {
      const err = new Error(
        "The request cannot be completed, unable to find any employee with the provided employeeID"
      );
      err.status = 404;
      return next(err);
    }

    if (employeeData.isAdmin) {
      const err = new Error(
        "You don't have the necessary permissions to complete this action"
      );
      err.status = 403;
      return next(err);
    }

    // update the employee
    Object.assign(employeeData, revisedEmployee);

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

// Exporting the module
module.exports = employeeFunctions;
