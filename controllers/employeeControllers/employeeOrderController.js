// This file handles all employee operations related to the inventory

// Importing modules
const Order = require("../../models/Order");

// Object to accumulate all the order functions
const orderFunctions = {};

// view orders - function
orderFunctions.viewOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({});

    if (!orders || orders.length === 0) {
      const err = new Error("No orders found!");
      err.status = 404;
      next(err);
    }

    res.status(200).json({
      message: "Orders included",
      count: orders.length,
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};

// Export the module
module.exports = orderFunctions;
