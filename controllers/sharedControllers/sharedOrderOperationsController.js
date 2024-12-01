// This file only creates a customer

// importing modules
const Order = require("../../models/Order");
const Inventory = require("../../models/Inventory");
const generateId = require("../../misc/generateId");
const currentNewYorkDateTime = require("../../misc/getNewYorkDateAndTime");
const mongoose = require("mongoose");

const sharedOrderFunctions = {};

// Create an order for a customer - function
sharedOrderFunctions.createOrder = async (req, res, next) => {
  // Start a session and transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate the request body
    if (validateOrderBody(req, res, next)) {
      return;
    }

    // Extract properties from the request body
    const {
      items,
      customerID,
      totalPrice,
      tax,
      grandTotal,
      discountInPercentage,
    } = req.body;

    // Order details
    const orderID = generateId("ORD_");
    const orderStatus = "processing";
    const orderDate = currentNewYorkDateTime();

    const placedBy = req.user.id.startsWith("EMP_") ? req.user.id : "customer";


    // this order data will collect order data for the new order
    const orderData = {
      orderID,
      orderStatus,
      orderDate,
      placedBy,
      customerID,
      totalPrice,
      tax,
      grandTotal,
    };

    // Include discount if provided
    if (discountInPercentage) {
      orderData.discountInPercentage = discountInPercentage;
    }

    // This products array will collect all the necessary information and it will be added in the new order after completion
    const products = [];

    // Step 1: Fetch the current quantities and restock thresholds
    const productIDs = items.map((boughtProduct) => boughtProduct.productID);

    const inventory = await Inventory.aggregate([
      { $unwind: "$products" },
      { $match: { "products.productID": { $in: productIDs } } },
      {
        $project: {
          _id: 0,
          productID: "$products.productID",
          productName: "$products.productName",
          productDescription: "$products.productDescription",
          imageUrl: "$products.imageUrl",
          unitPrice: "$products.unitPrice",
          currentQuantity: "$products.stockInfo.currentQuantity",
          restockThreshold: "$products.stockInfo.restockThreshold",
          totalSold: "$products.stockInfo.totalSold",
          stockStatus: "$products.stockInfo.stockStatus",
        },
      },
    ]).session(session);

    // Create a map for quick access
    const inventoryMap = {};
    inventory.forEach((product) => {
      inventoryMap[product.productID] = product;
    });

    // Step 2: Validate the requested quantities
    for (const boughtProduct of items) {
      const product = inventoryMap[boughtProduct.productID];
      if (!product) {
        const err = new Error(
          `Product with ID ${boughtProduct.productID} not found`
        );
        err.status = 404;
        return next(err);
      }

      if (boughtProduct.quantity > product.currentQuantity) {
        const err = new Error(
          `Unable to complete the request. The order is invalid because the requested quantity for product ${product.productName} exceeds the available stock`
        );
        err.status = 400;
        return next(err);
      }
    }

    // Step 3: Prepare the update queries
    const updateQueriesArray = items.map((boughtProduct) => {
      const product = inventoryMap[boughtProduct.productID];

      // Calculate the new currentQuantity
      const newQuantity = product.currentQuantity - boughtProduct.quantity;

      // Determine the new stockStatus
      let stockStatus = "";
      if (newQuantity === 0) {
        stockStatus = "Out of Stock";
      } else if (newQuantity <= product.restockThreshold) {
        stockStatus = "Low Stock";
      } else {
        stockStatus = "In Stock";
      }

      // Setting the current availability status based on the stock status
      let currentAvailabilityStatus =
        stockStatus === "Out of Stock" ? "Unavailable" : "Available";

      products.push(
        Object.assign({ currentAvailabilityStatus }, boughtProduct, {
          productName: inventoryMap[boughtProduct.productID].productName,
          productDescription:
            inventoryMap[boughtProduct.productID].productDescription,
          imageUrl: inventoryMap[boughtProduct.productID].imageUrl,
          unitPrice: inventoryMap[boughtProduct.productID].unitPrice,
        })
      );

      return {
        updateOne: {
          filter: { "products.productID": boughtProduct.productID },
          update: {
            $inc: {
              "products.$.stockInfo.currentQuantity": -boughtProduct.quantity,
              "products.$.stockInfo.totalSold": boughtProduct.quantity,
            },
            $set: {
              "products.$.stockInfo.stockStatus": stockStatus,
            },
          },
        },
      };
    });

    // Step 4: Perform the bulk update within the transaction
    await Inventory.bulkWrite(updateQueriesArray, { session });

    // add the products into the order data as items
    orderData.items = products;

    // now create a new order using the order Data
    const newOrder = new Order(orderData);

    // save the order as a part of the session
    await newOrder.save({ session });

    // Finally Commit the transaction
    await session.commitTransaction();

    // terminate the session
    session.endSession();

    // Send the response back to the client
    return res.status(201).json({
      message: "New order created",
      data: { ...newOrder.toObject() },
    });
  } catch (err) {
    // Abort the transaction and pass the error to the error handler
    await session.abortTransaction();
    session.endSession();
    next(err);
  } finally {
    session.endSession();
  }
};

// Cancel an order - function
sharedOrderFunctions.cancelAnOrder = async (req, res, next) => {
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
sharedOrderFunctions.removeAnItemFromTheOrder = async (req, res, next) => {
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
      data: { order: { ...order.toObject() } },
    });
  } catch (err) {
    return next(err);
  }
};

//* validate the request body - helper function
const validateOrderBody = (req, res, next) => {
  const {
    items,
    customerID,
    totalPrice,
    grandTotal,
    tax,
    discountInPercentage,
  } = req.body;

  // Validating the fields request body

  if (
    discountInPercentage !== undefined &&
    (isNaN(Number(discountInPercentage)) || discountInPercentage === "")
  ) {
    const err = new Error(
      `The request cannot be processed. Please provide a valid number for the discount percentage`
    );
    err.status = 400;
    next(err); // Pass the error to the error handler
    return true; // Exit validation as soon as an error is found
  }

  // Outer body validation
  if (
    !items ||
    items.length === 0 ||
    !customerID ||
    !totalPrice ||
    !grandTotal ||
    !tax
  ) {
    // An array that will gather all the missing items
    const missingItems = [];

    // Collect missing required fields
    const requiredFields = [
      "items",
      "customerID",
      "totalPrice",
      "grandTotal",
      "tax",
    ];
    requiredFields.forEach((field) => {
      if (
        !req.body[field] ||
        (field === "items" && req.body[field].length === 0)
      ) {
        missingItems.push(field);
      }
    });

    if (missingItems.length > 0) {
      const err = new Error(
        `Request cannot be completed, the following fields are missing or invalid: ${missingItems.join(
          ", "
        )}`
      );
      err.status = 400;
      next(err);
      return true;
    }
  }

  // Inner body validation. Now checking fields inside the items array
  const requiredFieldsInProducts = ["productID", "quantity", "subtotal"];

  const hasError = items.some((obj) => {
    // Check for missing or invalid fields
    const missingField = requiredFieldsInProducts.some((field) => {
      if (
        obj[field] === undefined ||
        obj[field] === null ||
        obj[field] === "" ||
        obj[field] === 0
      ) {
        const err = new Error(
          `Request cannot be completed. The field '${field}' in the items array is missing or invalid (empty or null or 0). Each product must have 'productID', 'quantity' and 'subtotal'.`
        );
        err.status = 400;
        next(err); // Pass the error to the error handler
        return true; // Exit validation as soon as an error is found
      }
      return false;
    });

    if (missingField) {
      return true; // Stop further execution if a missing or invalid field is found
    }

    // Check for unwanted fields
    const unwantedField = Object.keys(obj).some((key) => {
      if (!requiredFieldsInProducts.includes(key)) {
        const err = new Error(
          `Request cannot be completed. The field '${key}' is not allowed in the items array. Only the following fields are allowed: 'productID, 'quantity', and 'subtotal'.`
        );
        err.status = 400;
        next(err);
        return true; // Exit as soon as an unwanted field is found
      }
      return false;
    });

    return unwantedField; // If an unwanted field is found, stop execution
  });

  // Stop further execution if an error is detected
  if (hasError) {
    return true;
  } else {
    return false;
  }
};

// Export the module
module.exports = sharedOrderFunctions;
