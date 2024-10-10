// This file has the logic for updating an employee's own information

// importing modules
const Employee = require("../../models/Employee");
const bcrypt = require("bcrypt");

// object to accumulate all functions
const employeeUpdateFunctions = {};

// Update general information - function
employeeUpdateFunctions.updateGeneralInfo = async (req, res, next) => {
  // Retrieving the id passed with the parameter
  const employeeId = req.params.id;

  // Retrieve the update information
  const generalUpdateInfo = req.body;

  // If there are no body provided in the request
  if (Object.keys(generalUpdateInfo).length === 0) {
    const err = new Error(
      "The request cannot be processed without providing the updated employee information."
    );
    err.status = 400;
    return next(err);
  }

  const allowedKeys = ["phone", "address"];
  // Verify the information to be only 'address' and 'phone'
  for (let key in generalUpdateInfo) {
    if (!allowedKeys.includes(key)) {
      const err = new Error(
        "The request cannot be processed. You can only update 'address' and 'phone' at this time."
      );
      err.status = 400;
      return next(err);
    }
  }

  // Now see if you can find an employee with the employee id provided
  const employeeData = await Employee.findOne({ employeeID: employeeId });

  // If no employee found
  if (!employeeData) {
    const err = new Error("Employee not found with the provided ID.");
    err.status = 404;
    return next(err);
  }

  // Update phone if provided and not empty
  if (generalUpdateInfo.phone && generalUpdateInfo.phone.trim() !== "") {
    employeeData.phone = generalUpdateInfo.phone;
  }

  // Validate and update address if provided
  if (generalUpdateInfo.address) {
    // Now check if these necessary fields are provided
    const { street, city, state, zipCode, country } = generalUpdateInfo.address;
    if (!street || !city || !state || !zipCode || !country) {
      const err = new Error(
        "Some fields might be missing in the address. Make sure to include 'street', 'city', 'state', 'zipCode', and 'country'."
      );
      err.status = 400;
      return next(err);
    }
    employeeData.employeeBio.address = generalUpdateInfo.address;
  }

  // If both fields are missing or empty, throw an error
  if (!generalUpdateInfo.phone && !generalUpdateInfo.address) {
    const err = new Error(
      "You must provide values for either phone or address."
    );
    err.status = 400;
    return next(err);
  }

  // Save the updated employee information
  await employeeData.save();

  // Send response
  return res.status(200).json({
    message: "Information updated successfully.",
    data: employeeData, // Returning the updated employee data
  });
};

// Change password - function
employeeUpdateFunctions.changePassword = async (req, res, next) => {
  try {
    // Retrieving the id passed with the parameter
    const employeeId = req.params.id;

    // Retrieve the passwords
    const { currentPassword, newPassword } = req.body;

    // Check if the passwords are provided
    if (!currentPassword || !newPassword) {
      const err = new Error(
        "You must provide the current and the new passwords with the request"
      );
      err.status = 400;
      return next(err);
    }

    // Now see if you can find an employee with the employee id provided, retrieve the password as well
    const employeeData = await Employee.findOne({
      employeeID: employeeId,
    }).select("+password");

    // If no employee found
    if (!employeeData) {
      const err = new Error("Employee not found with the provided ID.");
      err.status = 404;
      return next(err);
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(
      currentPassword,
      employeeData.password
    );

    // If no match
    if (!isMatch) {
      const err = new Error("Current password does not match!");
      err.status = 400;
      return next(err);
    }

    // Check if the current password equals to new password
    if (currentPassword === newPassword) {
      const err = new Error(
        "New password cannot be same as the current password!"
      );
      err.status = 400;
      return next(err);
    }

    // Now hash the current password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Now update the password
    employeeData.password = hashedPassword;

    // Save the employee
    await employeeData.save();

    // Send response
    return res.status(200).json({
      message: "Password changed successfully",
      data: { email: employeeData.email, employeeId: employeeData.employeeID }, // Returning the employee data
    });
  } catch (err) {
    next(err);
  }
};

// export the module
module.exports = employeeUpdateFunctions;
