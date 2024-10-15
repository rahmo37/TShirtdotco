// This file handles all the orders related requests a customer has

// Importing modules
const Order = require("../../models/Order");

// Object to accumulate all the order functions
const orderFunctions = {};

// view orders - function
orderFunctions.viewOrders = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    if (customerId !== req.user.id) {
      const err = new Error(
        "Request cannot be completed, The customerId provided in the url is not logged in"
      );
      err.status = 400;
      return next(err);
    }

    const orders = await Order.find({
      customerID: customerId,
    });

    if (!orders || orders.length === 0) {
      const err = new Error("No orders found for this customer");
      err.status = 404;
      return next(err);
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
