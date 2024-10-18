// This file retries the current inventory

// Importing modules
const Inventory = require("../../models/Inventory");

// view inventory - function
const currentInventory = async (req, res, next) => {
  try {
    // excluding the mongoose given ids, since we are using more meaningful ids
    const fullInventory = await Inventory.find(
      {},
      { _id: 0, "products._id": 0, "products.stockInfo._id": 0 }
    );

    // checking if the inventory is empty or not
    const emptyInventory = fullInventory.every(
      (category) => category.products.length === 0
    );

    // send an error if the inventory is empty
    if (emptyInventory) {
      const err = new Error("There are not products in the inventory");
      err.status = 500;
      next(err);
    }

    // Sending the inventory data
    res
      .status(200)
      .json({ message: "Inventory data included", data: fullInventory });
  } catch (err) {
    return next(err);
  }
};

// Exporting the module
module.exports = currentInventory;
