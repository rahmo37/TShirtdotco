// This file only creates a customer

// importing modules
const Order = require("../../models/Order");
const generateId = require("../../misc/generateId");


// create an order - function
const createOrder = async (req, res, next) => {
  try {

    // Send response
    return res.status(201).json({
      message: "New order created",
      data: {  },
    });
  } catch (err) {
    next(err);
  }
};


// Export the module
module.exports = createOrder;
