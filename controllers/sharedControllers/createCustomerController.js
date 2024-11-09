// This file only creates a customer

// importing modules
const Customer = require("../../models/Customer");
const generateId = require("../../misc/generateId");
const { getHashedPassword } = require("../../misc/hashPassword");
const currentNewYorkDateTime = require("../../misc/getNewYorkDateAndTime");
// create a customer - function
const createCustomer = async (req, res, next) => {
  try {
    // retrieving the new customer data
    const customerData = req.body;

    // if customer data is not provided
    if (Object.keys(customerData).length == 0) {
      const err = new Error(
        "The request cannot be processed without providing the new customer's information"
      );
      err.status = 400;
      return next(err);
    }

    // checking for password
    if (!customerData.password) {
      const err = new Error("Password is required to create a customer");
      err.status = 400;
      return next(err);
    }

    // checking for email
    if (!customerData.email) {
      const err = new Error("Email is required to create a customer");
      err.status = 400;
      return next(err);
    }

    // checking for phone number
    if (!customerData.phone) {
      const err = new Error("Phone number is required to create a customer");
      err.status = 400;
      return next(err);
    }

    // retrieving the email
    const email = await Customer.findOne({
      email: customerData.email,
    });

    // checking if a customer with that email already exists
    if (email) {
      const err = new Error("A customer with this email already exists");
      err.status = 409;
      return next(err);
    }

    // retrieving phone
    const phone = await Customer.findOne({
      phone: customerData.phone,
    });

    // checking if a customer with that email already exists
    if (phone) {
      const err = new Error("A customer with this phone number already exists");
      err.status = 409;
      return next(err);
    }

    // hashing the customer's password
    const hashedPassword = await getHashedPassword(customerData.password);

    // generating an id for the customer
    const customerId = generateId("CUS_");

    // get the current date and time for account created variable
    const accountCreated = currentNewYorkDateTime();

    // add the above properties to the customer
    customerData.password = hashedPassword;
    customerData.customerID = customerId;
    customerData.accountCreated = accountCreated;
    customerData.accountStatus = "Active";

    // save the customer
    await new Customer(customerData).save();

    // delete the password before sending
    delete customerData.password;

    // Send response
    return res.status(201).json({
      message: "New customer created",
      data: { customerData },
    });
  } catch (err) {
    next(err);
  }
};

// Export the module
module.exports = createCustomer;
