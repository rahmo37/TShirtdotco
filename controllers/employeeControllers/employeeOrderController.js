// This file handles all employee operations related to the inventory

// Importing modules
const Order = require("../../models/Order");
const Inventory = require("../../models/Inventory");
const mongoose = require("mongoose");

// Object to accumulate all the order functions
const orderFunctions = {};

// view orders - function
orderFunctions.viewOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({});

    if (!orders || orders.length === 0) {
      const err = new Error("No orders found!");
      err.status = 404;
      return next(err);
    }

    res.status(200).json({
      message: "Orders included",
      count: orders.length,
      data: { orders },
    });
  } catch (err) {
    return next(err);
  }
};

// change order status - function
orderFunctions.changeOrderStatus = async (req, res, next) => {
  try {
    // Retrieve the order status from the body
    const { orderStatus } = req.body;
    const orderID = req.params.orderId;

    // If the order status is not provided
    if (!orderStatus) {
      const err = new Error("You must provide the updated order status");
      err.status = 400;
      return next(err);
    }

    // Find the order with the give order id
    const order = await Order.findOne({ orderID });

    // If no order is found
    if (!order) {
      const err = new Error("No order found with the given orderId");
      err.status = 404;
      return next(err);
    }

    // If the order is completed
    if (order.orderStatus === "completed") {
      const err = new Error(
        "This order is completed, thus no changes can be made!"
      );
      err.status = 404;
      return next(err);
    }

    // If the update status is same as current status
    if (order.orderStatus === orderStatus) {
      const err = new Error(`This order is already ${orderStatus}`);
      err.status = 404;
      return next(err);
    }

    const acceptedStatus = ["processing", "shipped", "completed"];
    if (!acceptedStatus.includes(orderStatus)) {
      const err = new Error(
        `You can only change an order's status to 'processing','shipped' or 'completed' through this URL`
      );
      err.status = 400;
      return next(err);
    }

    // Now change the status
    order.orderStatus = orderStatus;

    // Then save the order
    await order.save();

    res.status(200).json({
      message: "Order status changed",
      data: { order },
    });
  } catch (err) {
    return next(err);
  }
};

// add discount - function
// add discount - function
orderFunctions.addDiscount = async (req, res, next) => {
  try {
    // Retrieve the discount percentage from the body
    const { discountInPercentage } = req.body;
    const orderID = req.params.orderId;

    // Validate discountInPercentage
    if (
      !discountInPercentage ||
      isNaN(Number(discountInPercentage)) ||
      discountInPercentage === "" ||
      discountInPercentage <= 0 ||
      discountInPercentage > 100
    ) {
      const err = new Error(
        "The request cannot be processed. Please ensure you provide a valid discount percentage between 1 and 100"
      );
      err.status = 400;
      return next(err); // Pass the error to the error handler
    }

    // Find the order with the given order id
    const order = await Order.findOne({ orderID });

    // If no order is found
    if (!order) {
      const err = new Error("No order found with the given orderId");
      err.status = 404;
      return next(err);
    }

    // If the order is completed or cancelled
    if (
      order.orderStatus === "completed" ||
      order.orderStatus === "cancelled"
    ) {
      const err = new Error(
        "This order is settled, thus no changes can be made!"
      );
      err.status = 400;
      return next(err);
    }

    // Recalculate the totalPrice from the items' subtotals
    const totalPrice = order.items.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );

    // Now add or update the discountInPercentage property
    order.discountInPercentage = discountInPercentage;

    // Calculate the discount amount
    const discountAmount = (totalPrice * discountInPercentage) / 100;

    // Calculate the discounted total
    const discountedTotal = totalPrice - discountAmount;

    // Update the order's totalPrice and grandTotal
    order.totalPrice = +discountedTotal.toFixed(2);
    order.grandTotal = +(discountedTotal + order.tax).toFixed(2);

    // Then save the order
    await order.save();

    res.status(200).json({
      message: "Discount successfully applied to the order",
      data: { order },
    });
  } catch (err) {
    return next(err);
  }
};

// Export the module
module.exports = orderFunctions;
