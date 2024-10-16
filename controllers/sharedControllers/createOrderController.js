// This file only creates a customer

// importing modules
const Order = require("../../models/Order");
const Inventory = require("../../models/Inventory");
const generateId = require("../../misc/generateId");
const currentNewYorkDateTime = require("../../misc/getNewYorkDateAndTime");
const mongoose = require("mongoose");

// Create an order for a customer - function
const createOrder = async (req, res, next) => {
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

    // TODO uncomment this line once the jwt is active
    // const placedBy = req.user.id.startsWith("EMP_") ? req.user.id : "customer";

    // TODO delete this line once jwt is active
    const placedBy = "customer";

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
module.exports = createOrder;
