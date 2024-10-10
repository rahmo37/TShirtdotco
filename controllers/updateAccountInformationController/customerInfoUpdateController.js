// This file has the logic for updating a customer's own information

// importing modules
const Customer = require("../../models/Customer");
const bcrypt = require("bcrypt");

// object to accumulate all functions
const customerUpdateFunctions = {};

customerUpdateFunctions.updateGeneralInfo = async (req, res, next) => {
  // Checking if the passed in CustomerId matches the id used to sign in the token
  const customerId = req.params.id;

  // Retrieve the update information
  const generalUpdateInfo = req.body;

  // If there are no body provided in the request
  if (Object.keys(generalUpdateInfo).length === 0) {
    const err = new Error(
      "The request cannot be processed without providing the updated customer information."
    );
    err.status = 400;
    return next(err);
  }

  // Current allowed keys
  const allowedKeys = ["phone", "address"];
  //Verify the information to be only 'address' and 'phone'

  for (let key in generalUpdateInfo) {
    if (!allowedKeys.includes(key)) {
      const err = new Error(
        "The request cannot be processed. You can only update 'address' and 'phone' at this time."
      );
      err.status = 400;
      return next(err);
    }
  }

  // Now see if we can find a customer with the provided customerId
  const customerData = await Customer.findOne({
    customerID: customerId,
  });

  // If no customer found
  if (!customerData) {
    const err = new Error("Customer not found with the provided ID.");
    err.status = 404;
    return next(err);
  }

  // Update phone if not provided and not empty
  if (generalUpdateInfo.phone && generalUpdateInfo.phone.trim() !== "") {
    customerData.phone = generalUpdateInfo.phone;
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
    customerData.customerBio.address = generalUpdateInfo.address;
  }

  // Save the updated customer information
  await customerData.save();

  // Send response
  return res.status(200).json({
    message: "Information updated successfully.",
    data: customerData, // Returning the updated customer data
  });
};

// Change password - function
customerUpdateFunctions.changePassword = async (req, res, next) => {
  try {
    // Retrieving the id passed with the parameter
    const customerId = req.params.id;

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

    // Now see if you can find an customer with the customer id provided, retrieve the password as well
    const customerData = await Customer.findOne({
      customerID: customerId,
    }).select("+password");

    // If no customer found
    if (!customerData) {
      const err = new Error("Customer not found with the provided ID.");
      err.status = 404;
      return next(err);
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(
      currentPassword,
      customerData.password
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
    customerData.password = hashedPassword;

    // Save the customer
    await customerData.save();

    // Send response
    return res.status(200).json({
      message: "Password changed successfully",
      data: { email: customerData.email, customerId: customerData.customerID }, // Returning the customer data
    });
  } catch (err) {
    next(err);
  }
};

// export the module
module.exports = customerUpdateFunctions;
