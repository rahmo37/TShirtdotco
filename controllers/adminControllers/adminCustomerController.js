// This file handles all the customer related operation admin has

// importing modules
const Customer = require("../../models/Customer");
const generateId = require("../../misc/generateId");
const { getHashedPassword } = require("../../misc/hashPassword");

// object to accumulate all functions
const customerFunctions = {};

// view customer - function
customerFunctions.viewCustomers = async (req, res, next) => {
  try {
    const fullCustomerList = await Customer.aggregate([
      {
        // Use $project to exclude _id, customerBio._id, customerBio.address._id, password, and order _id fields
        $project: {
          _id: 0, // Exclude customer _id
          password: 0, // Exclude the password field
          "customerBio._id": 0, // Exclude sub-document _id
          "customerBio.address._id": 0, // Exclude address sub-document _id
        },
      },
      {
        // Use $lookup to join the Orders collection
        $lookup: {
          from: "orders", // The orders collection
          localField: "customerID", // Customer's customerID field
          foreignField: "customerID", // Order's customerID field
          as: "orders", // Store the joined orders in the 'orders' array
        },
      },
    ]);

    res.status(200).json({
      message: "Customer data included with corresponding orders",
      data: fullCustomerList,
    });
  } catch (err) {
    return next(err);
  }
};

// freeze customer account - function
customerFunctions.freezeCustomerAccount = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    const customerData = await Customer.findOne({
      customerID: customerId,
    });

    if (!customerData) {
      const err = new Error(
        "Request cannot be completed, because there is no customer exists with the customerId provided"
      );
      err.status = 404;
      return next(err);
    }

    if (customerData.accountStatus === "Frozen") {
      const err = new Error("This account is already frozen");
      err.status = 400;
      return next(err);
    }

    // Set the account status to Frozen
    customerData.accountStatus = "Frozen";

    // Then save the change
    await customerData.save();

    res.status(200).json({
      message: "Account freezed",
      data: {
        customerData,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// unfreeze a customer account - function
customerFunctions.unFreezeCustomerAccount = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    const customerData = await Customer.findOne({
      customerID: customerId,
    });

    if (!customerData) {
      const err = new Error(
        "Request cannot be completed, because there is no customer exists with the customerId provided"
      );
      err.status = 404;
      return next(err);
    }

    if (customerData.accountStatus === "Active") {
      const err = new Error("This account is already active");
      err.status = 400;
      return next(err);
    }

    // Set the account status to Active
    customerData.accountStatus = "Active";

    // Then save the change
    await customerData.save();

    res.status(200).json({
      message: "This account is now active",
      data: {
        customerData,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// update a customer
customerFunctions.updateCustomer = async (req, res, next) => {
  try {
    // Retrieve the customerId
    const { customerId } = req.params;
    const revisedCustomer = req.body;

    // checking if the updated date is provided
    if (!revisedCustomer) {
      const err = new Error("You must provide customer details to update");
      err.status = 400;
      return next(err);
    }

    // add the customerId back to the customer details
    revisedCustomer.customerID = customerId;

    let customerData = await Customer.findOne({
      customerID: customerId, // Query to find the customer by customerID
    });

    if (!customerData) {
      const err = new Error(
        "The request cannot be completed, unable to find any customer with the provided customerID"
      );
      err.status = 400;
      return next(err);
    }

    // update the customer
    Object.assign(customerData, revisedCustomer);

    // save the customer
    await customerData.save();

    res.status(200).json({
      message: "Customer updated successfully",
      data: {
        ...customerData.toObject(), // casting to mongoose object which will remove the password
      },
    });
  } catch (err) {
    return next(err);
  }
};

// create a customer
customerFunctions.createCustomer = async (req, res, next) => {
  try {
    // retrieving the new customer data
    const newCustomer = req.body;

    // if customer data is not provided
    if (Object.keys(newCustomer).length == 0) {
      const err = new Error(
        "The request cannot be processed without providing the new customer's information"
      );
      err.status = 400;
      return next(err);
    }

    if (!newCustomer.password) {
      const err = new Error("Password is required to create a customer");
      err.status = 400;
      return next(err);
    }

    // hashing the customer's password
    const hashedPassword = await getHashedPassword(newCustomer.password);

    // generating an id for the customer
    const customerId = generateId("CUS_");

    // get the current date and time for account created variable
    const accountCreated = new Date();

    // add the above properties to the customer
    newCustomer.password = hashedPassword;
    newCustomer.customerID = customerId;
    newCustomer.accountCreated = accountCreated;

    // save the customer
    await new Customer(newCustomer).save();

    // Send response
    return res.status(201).json({
      message: "New customer created",
      data: { ...newCustomer.toObject() },
    });
  } catch (err) {
    next(err);
  }
};

// exporting the module
module.exports = customerFunctions;
