// This file handles all admin operations related to the inventory

// Importing modules
const Inventory = require("../models/Inventory");
const Orders = require("../models/Order");
const mongoose = require("mongoose");

// object to accumulate all functions
const inventoryFunctions = {};

// view inventory function
inventoryFunctions.viewInventory = async (req, res, next) => {
  try {
    // excluding the mongoose given ids, since we are using more meaningful ids
    const fullInventory = await Inventory.find(
      {},
      { _id: 0, "products._id": 0, "products.stockInfo._id": 0 }
    );

    // Sending the inventory data
    res.status(200).json(fullInventory);
  } catch (err) {
    next(err);
  }
};

// delete a product function
inventoryFunctions.deleteProduct = async (req, res, next) => {
  const { categoryId, productId } = req.params;

  // starting a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /**
     * !Operation 1
     * check the inventory to see if the product exists or not
     */

    // checking inventory
    const inventoryBeforeUpdate = await Inventory.findOne({
      categoryID: categoryId,
      "products.productID": productId,
    });

    // if not available send error
    if (!inventoryBeforeUpdate) {
      await session.abortTransaction();
      session.endSession();
      const err = new Error(
        "Request cannot be completed, because the product is not found in the inventory!"
      );
      err.status = 404;
      return next(err);
    }

    /**
     * !Operation 2
     * After verifying, now we delete the product from the inventory
     */
    const updateInventory = await Inventory.findOneAndUpdate(
      {
        categoryID: categoryId,
      },
      { $pull: { products: { productID: productId } } },
      { new: true, session: session }
    );

    // if unable to delete
    if (!updateInventory) {
      await session.abortTransaction();
      session.endSession();
      const err = new Error("Product deletion failed!");
      err.status = 404;
      return next(err);
    }

    /**
     * !Operation 3
     * Update the availability of the product in the orders data if any
     */
    const test = await Orders.findOne({ "items.productID": productId });
    console.log(test);

    const updateOrder = await Orders.updateMany(
      { "items.productID": productId }, // find the orders with the matching product id
      { $set: { "items.$[elem].currentAvailabilityStatus": "Unavailable" } }, // update the current status to unavailable
      {
        arrayFilters: [{ "elem.productID": productId }], // Use the array filter to precisely target only the matching items, identified by the placeholder $[elem].
        session: session, //Run everything within the same transaction session to ensure atomicity.
      }
    );

    if (updateOrder.modifiedCount > 0) {
      console.log(`Successfully updated ${updateOrder.modifiedCount} orders.`);
    } else {
      console.log("No orders were updated.");
    }

    /**
     * !Operation 4
     * Finally commit the changes
     */
    await session.commitTransaction();

    // Send successful status
    res.status(200).json("Product Deleted!");
  } catch (err) {
    // cancel the transaction on error, if any
    await session.abortTransaction();

    // and send the error to error handler
    next(err);
  } finally {
    // End session
    session.endSession();
  }
};

module.exports = inventoryFunctions;
