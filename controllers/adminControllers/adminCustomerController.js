// This file handles all the customer related operation admin has

// importing modules
const Customer = require("../../models/Customer");
const generateId = require("../../misc/generateId");

// object to accumulate all functions
const customerFunctions = {};

// view customer - function
customerFunctions.viewCustomers = async (req, res, next) => {
  try {
    // excluding the mongoose given ids, since we are using more meaningful ids
    const fullCustomerList = await Customer.find(
      {},
      { _id: 0, "customerBio._id": 0, "customerBio.address._id": 0 }
    );

    res.status(200).json({
      message: "Customer data included",
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
      err.status = 404;
      return next(err);
    }

    // freeze the account status
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
      err.status = 404;
      return next(err);
    }

    // unfreeze the account status
    customerData.accountStatus = "Active";

    // Then save the change
    await customerData.save();

    res.status(200).json({
      message: "Account is now active",
      data: {
        customerData,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// Update a customer
customerFunctions.updateCustomer = async (req, res, next) => {
  try {
    // Retrieve the customerId
    const { customerId } = req.params;

    // TODO Start from here...

    res.status(200).json({
      customerId
      // message: "Account is now active",
      // data: {
      //   customerData,
      // },
    });
  } catch (err) {
    return next(err);
  }
};

// exporting the module
module.exports = customerFunctions;
