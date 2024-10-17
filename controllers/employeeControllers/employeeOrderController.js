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

    const acceptedStatus = ["processing", "shipped"];
    if (!acceptedStatus.includes(orderStatus)) {
      const err = new Error(
        `Only changes to the status "processing" or "shipped" are permitted through this URL`
      );
      err.status = 404;
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
orderFunctions.addDiscount = async (req, res, next) => {
  try {
    // Retrieve the order status from the body
    const { discountInPercentage } = req.body;
    const orderID = req.params.orderId;

    // If discountInPercentage is not provided or if the percentNumber is not valid
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
      err.status = 400;
      return next(err);
    }

    // Now add the discountInPercentage property
    Object.assign(order, { discountInPercentage });

    // Change the grand total
    const discountAmount = (order.totalPrice * discountInPercentage) / 100;
    const discountedTotal = order.totalPrice - discountAmount;
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

// Cancel an order - function
orderFunctions.cancelAnOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Retrieve the order ID from the request parameters
    const orderID = req.params.orderId;

    // Find the order with the given order ID
    const order = await Order.findOne({ orderID });

    // If no order is found, return a 404 error
    if (!order) {
      const err = new Error("No order found with the given orderId");
      err.status = 404;
      return next(err);
    }

    // If the order is completed, it cannot be canceled
    if (order.orderStatus === "completed") {
      const err = new Error(
        "This order is completed, thus no changes can be made!"
      );
      err.status = 400; // Use 400 Bad Request for invalid operations
      return next(err);
    }

    // If the order is already canceled, inform the user
    if (order.orderStatus === "cancelled") {
      const err = new Error("This order is already cancelled");
      err.status = 400; // Use 400 Bad Request for invalid operations
      return next(err);
    }

    // Extract the quantities from the order items and make the productId as each item's key
    const productQuantity = {};
    order.items.forEach((eachItem) => {
      productQuantity[eachItem.productID] = eachItem.quantity;
    });

    // Retrieve the list of product IDs from the order, so their corresponding products can be fetched out from the inventory
    const productIDs = Object.keys(productQuantity);

    // Retrieve inventory information for the products in the order
    const inventory = await Inventory.aggregate([
      { $unwind: "$products" }, // Deconstruct the products array
      { $match: { "products.productID": { $in: productIDs } } }, // Match products in the order
      {
        $project: {
          _id: 0,
          productID: "$products.productID",
          currentQuantity: "$products.stockInfo.currentQuantity",
          restockThreshold: "$products.stockInfo.restockThreshold",
          totalSold: "$products.stockInfo.totalSold",
          stockStatus: "$products.stockInfo.stockStatus",
        },
      },
    ]).session(session);

    // Prepare bulk update queries to restock the inventory
    const updateQueriesArray = Object.keys(productQuantity)
      // Filter out product IDs that don't exist in the inventory. Important if the item in the order is discontinued
      .filter((id) => inventory.find((product) => product.productID === id))
      .map((id) => {
        // Find the product in the inventory
        const product = inventory.find((product) => product.productID === id);

        // Retrieve the quantity to restock
        const quantityToRestock = productQuantity[id];

        // Calculate the new quantity incase we need to update the stockStatus
        const newQuantity = product.currentQuantity + quantityToRestock;

        // Determine the new stock status based on the restock threshold
        const stockStatus =
          newQuantity > product.restockThreshold ? "In Stock" : "Low Stock";

        // Create the update query for this product
        return {
          updateOne: {
            filter: { "products.productID": product.productID },
            update: {
              $inc: {
                "products.$.stockInfo.currentQuantity": quantityToRestock,
                "products.$.stockInfo.totalSold": -quantityToRestock,
              },
              $set: {
                // Update the stock status
                "products.$.stockInfo.stockStatus": stockStatus,
              },
            },
          },
        };
      });

    // Execute the bulk update queries to restock inventory
    await Inventory.bulkWrite(updateQueriesArray, { session });

    // Update the order status to 'cancelled'
    order.orderStatus = "cancelled";

    // Save the updated order to the database
    await order.save({ session });

    // Finally Commit the transaction
    await session.commitTransaction();

    // Send a success response with the updated order information
    res.status(200).json({
      message: "Order cancelled and inventory restocked",
      data: { order },
    });
  } catch (err) {
    // Abort the transaction and pass the error to the error handler
    await session.abortTransaction();
    session.endSession();
    // Pass any errors to the error handling middleware
    return next(err);
  } finally {
    session.endSession();
  }
};

// Remove an item from the order - function
orderFunctions.removeAnItemFromTheOrder = async (req, res, next) => {
  try {
    // retrieve the orderId from the URL
    const orderID = req.params.orderId;
    // retrieve the productId from the the body
    const productID = req.body.productId;

    // check the productId
    if (!productID || productID === "") {
      const err = new Error(
        "ProductId must be provided in the body and cannot be empty string"
      );
      err.status = 400;
      return next(err);
    }

    // Now retrieve the order
    const order = await Order.findOne({ orderID });

    // Check if the order exist with the provided orderId
    if (!order) {
      const err = new Error(
        "Request cannot be completed, because no order was found with the orderId provided"
      );
      err.status = 404;
      return next(err);
    }

    // If the order is already completed
    if (order.orderStatus === "completed") {
      const err = new Error(
        "This order is completed, thus no changes can be made!"
      );
      err.status = 400; // Use 400 Bad Request for invalid operations
      return next(err);
    }

    // Now check if the item exists in the order
    const item = order.items.find((product) => product.productID === productID);

    // Check the item if it exists
    if (!item) {
      const err = new Error(
        "No product was found in the order matching the provided productId. Please recheck the productId and try again"
      );
      err.status = 404;
      return next(err);
    }

    // If this is the only item in the order its better to use the cancel order route
    if (order.items.length === 1) {
      const err = new Error(
        "This is the only item in the order and cannot be removed. If necessary, please use the cancel order route to cancel the order"
      );
      err.status = 400;
      return next(err);
    }

    // Retrieve the subtotal for future use in updating the order's price information
    const subtotal = item.subtotal;

    // Now lets find the product from the inventory
    //! Note that if we cannot find the order in the inventory that means we discontinued the product, In that case we will just remove the product from the order, without making any changes to the inventory
    const inventory = await Inventory.findOne({
      "products.productID": productID,
    });

    if (inventory) {
      const product = inventory.products.find(
        (product) => product.productID === productID
      );

      if (product) {
        const productStockInfo = product.stockInfo;

        // Retrieve the quantity to restock
        const quantityToRestock = item.quantity;

        // Calculate the new quantity incase we need to update the stockStatus
        const newQuantity =
          productStockInfo.currentQuantity + quantityToRestock;

        const newTotalSold = productStockInfo.totalSold - quantityToRestock;

        // Determine the new stock status based on the restock threshold
        const stockStatus =
          newQuantity > productStockInfo.restockThreshold
            ? "In Stock"
            : "Low Stock";

        // Change the updated information
        productStockInfo.currentQuantity = newQuantity;
        productStockInfo.stockStatus = stockStatus;
        productStockInfo.totalSold = newTotalSold;

        // Then save the inventory
        await inventory.save();
      }
    }

    // Now remove the product from the order and recalculate the price
    const index = order.items.findIndex(
      (product) => product.productID === productID
    );

    if (index !== -1) {
      // Remove the item from the array
      order.items.splice(index, 1);
    } else {
      const err = new Error(
        "An unexpected error occurred, and the product could not be removed"
      );
      err.status = 500;
      return next(err);
    }

    // Now we are recalculating the price information
    // Recalculate the total price from remaining items
    const totalPriceBeforeDiscount = order.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    // Apply the discount if any
    let discountAmount = 0;
    if (order.discountInPercentage) {
      discountAmount =
        (totalPriceBeforeDiscount * order.discountInPercentage) / 100;
    }

    // Calculate tax on the total price before discount
    const taxRate = 8; // Since we are applying 8% tax rate
    const tax = (totalPriceBeforeDiscount * taxRate) / 100;

    // Calculate the total price after discount
    const totalPriceAfterDiscount = totalPriceBeforeDiscount - discountAmount;

    // Calculate the grand total
    const grandTotal = +(totalPriceAfterDiscount + tax).toFixed(2);

    // Update the order with new calculations
    order.totalPrice = +totalPriceAfterDiscount.toFixed(2);
    order.tax = +tax.toFixed(2);
    order.grandTotal = grandTotal;

    await order.save();

    res.status(200).json({
      message:
        "Product removed from the order successfully, new prices has been updated",
      data: { ...order.toObject() },
    });
  } catch (err) {
    return next(err);
  }
};
// Export the module
module.exports = orderFunctions;
