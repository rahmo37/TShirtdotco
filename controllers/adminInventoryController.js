// This file handles all admin operations related to the inventory

// Importing modules
const Inventory = require("../models/Inventory");
const Orders = require("../models/Order");
const mongoose = require("mongoose");
const generateId = require("../misc/generateId");

// object to accumulate all functions
const inventoryFunctions = {};

// view inventory - function
inventoryFunctions.viewInventory = async (req, res, next) => {
  try {
    // excluding the mongoose given ids, since we are using more meaningful ids
    const fullInventory = await Inventory.find(
      {},
      { _id: 0, "products._id": 0, "products.stockInfo._id": 0 }
    );

    // Sending the inventory data
    res
      .status(200)
      .json({ message: "Inventory data included", data: fullInventory });
  } catch (err) {
    return next(err);
  }
};

// delete a product - function
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
      const err = new Error("Product not found, thus cannot be deleted!");
      err.status = 404;
      return next(err);
    }

    /**
     * !Operation 3
     * Update the availability of the product in the orders data if any
     */
    const test = await Orders.findOne({ "items.productID": productId });

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
    res.status(200).json({ message: "Product Deleted!" });
  } catch (err) {
    // cancel the transaction on error, if any
    await session.abortTransaction();

    // and send the error to error handler
    return next(err);
  } finally {
    // End session
    // This runs regardless of any errors or returns
    session.endSession();
  }
};

inventoryFunctions.updateProduct = async (req, res, next) => {
  // Retrieving the ids, category name and the revised product
  const { categoryId, productId } = req.params;
  const categoryName = req.body.categoryName;
  const revisedProduct = req.body.product;

  // checking if the fields are provided
  if (!categoryName && !revisedProduct) {
    const err = new Error(
      "You must provide a category name or product details to update."
    );
    err.status = 400;
    return next(err);
  }

  // Database update starts...
  try {
    const updatedInventory = await Inventory.findOneAndUpdate(
      {
        categoryID: categoryId,
        "products.productID": productId,
      },
      {
        categoryName: categoryName,
        "products.$": revisedProduct,
      },
      {
        new: true,
      }
    );

    // if nor product is found
    if (!updatedInventory) {
      const err = new Error(
        "The request cannot be completed, because Category or Product provided does not exist in the Inventory!"
      );
      err.status = 404;
      return next(err);
    }

    // Send success message and the updated product
    res.status(200).json({
      message: "Updated successfully",
      data: updatedInventory,
    });
  } catch (err) {
    return next(err);
  }
};

inventoryFunctions.createProduct = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const generatedProductId = generateId("PRO_");

    if (categoryId.toLowerCase() === "new") {
      const newCategoryWithProduct = {};
      const newProductsArray = [];
      const { categoryName } = req.body;
      const { product } = req.body;
      const generatedCategoryId = generateId("CAT_");

      // if category name and product is not provided
      if (!categoryName || !product) {
        const err = new Error(
          "You must provide a category name and a valid product"
        );
        err.status = 400;
        return next(err);
      }

      const categoryExists = await Inventory.findOne({
        categoryName: categoryName,
      });
      if (categoryExists) {
        const err = new Error(
          "A category with the provided name already exists. If you are adding a new product to an existing category, please a provide a corresponding category id with the URL"
        );
        err.status = 400;
        return next(err);
      }

      // Assign generated product ID to the new product
      product.productID = generatedProductId;
      newProductsArray.push(product);

      // Combine into a new category object
      newCategoryWithProduct.categoryName = categoryName;
      newCategoryWithProduct.categoryID = generatedCategoryId;
      newCategoryWithProduct.products = newProductsArray;

      // Save the new category with the product
      const newCategory = new Inventory(newCategoryWithProduct);
      await newCategory.save();

      // Send response
      res.status(200).json({
        message: "new category with the product created",
        data: newCategoryWithProduct,
      });
    } else if (categoryId.slice(0, 4) === "CAT_" && categoryId.length === 16) {
      // Retrieving the category where the product will be pushed
      const category = await Inventory.findOne({ categoryID: categoryId });

      // if invalid category id provided
      if (!category) {
        const err = new Error("Invalid category id provided!");
        err.status = 400;
        return next(err);
      }

      // retrieve the product from the request body
      const { product } = req.body;
      if (!product) {
        const err = new Error("You must provide a valid product");
        err.status = 400;
        return next(err);
      }

      // add the generated id in the product
      product.productID = generatedProductId;

      // now push the new product
      category.products.push(product);

      // save the category
      await category.save();

      // send a response
      res.status(200).json({
        message: "new product created",
        data: category.toObject(),
      });
    } else {
      const err = new Error(
        `Please provide a correct parameter with the URL. Add the word "new" for a new category or a valid category id for adding product in an existing category`
      );
      err.status = 400;
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
};

module.exports = inventoryFunctions;
