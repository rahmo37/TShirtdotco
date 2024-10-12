// This file handles all admin operations related to the inventory

// Importing modules
const Inventory = require("../../models/Inventory");
const Orders = require("../../models/Order");
const mongoose = require("mongoose");
const generateId = require("../../misc/generateId");
const dynamicObjectUpdate = require("../../misc/dynamicObjectUpdate");

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

    // checking if the inventory is empty o not
    const emptyInventory = fullInventory.every(
      (category) => category.products.length === 0
    );

    // send an error if the inventory is empty
    if (emptyInventory) {
      const err = new Error("Empty Inventory");
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

// delete a product - function
inventoryFunctions.deleteProduct = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { categoryId, productId } = req.params;

    // starting a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

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

// update a product - function
inventoryFunctions.updateProduct = async (req, res, next) => {
  try {
    // Retrieving the ids, category name and the revised product
    const { categoryId, productId } = req.params;
    const revisedData = req.body;

    // checking if the fields are provided
    if (!revisedData || Object.keys(revisedData).length === 0) {
      const err = new Error(
        "You must provide a category name or product details to update."
      );
      err.status = 400;
      return next(err);
    }

    // Get the category with provided ids
    let categoryData = await Inventory.findOne({
      categoryID: categoryId,
      "products.productID": productId,
    });

    // if product is not found
    if (!categoryData) {
      const err = new Error(
        "The request cannot be completed, unable to find any category or product with the provided ids"
      );
      err.status = 404;
      return next(err);
    }

    // Get the specific product from the products array
    const targetProduct = categoryData.products.find(
      (product) => product.productID === productId
    );

    // Check if target product exists
    if (!targetProduct) {
      const err = new Error(
        "Product with provided ID not found in the category"
      );
      err.status = 404;
      return next(err);
    }

    // update the product
    Object.assign(
      targetProduct,
      dynamicObjectUpdate(targetProduct.toObject(), revisedData)
    );

    // If a category name needs to be updated
    if (revisedData.categoryName) {
      categoryData.categoryName = revisedData.categoryName;
    }

    // then save the category object
    await categoryData.save();

    // Send success message and the updated product
    res.status(200).json({
      message: "Updated successfully",
      data: {
        category: categoryData.categoryName,
        updateProduct: targetProduct,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// create a product - function
inventoryFunctions.createProduct = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { categoryName, product } = req.body;

    // Ensure product is provided
    if (!product) {
      const err = new Error("You must provide a valid product");
      err.status = 400;
      return next(err);
    }

    // Assign productId and dateAdded
    const generatedProductId = generateId("PRO_");
    product.productID = generatedProductId;
    product.dateAdded = new Date();
    product.stockInfo.lastRestock = new Date();

    if (categoryId.toLowerCase() === "new") {
      const newProductsArray = [];
      const generatedCategoryId = generateId("CAT_");

      // Ensure categoryName is provided
      if (!categoryName) {
        const err = new Error(
          "You must provide a category name and a valid product"
        );
        err.status = 400;
        return next(err);
      }

      // Check if the category already exists
      const categoryExists = await Inventory.findOne({ categoryName });
      if (categoryExists) {
        const err = new Error(
          "A category with the provided name already exists. If you are adding a new product to an existing category, please provide a corresponding category ID with the URL"
        );
        err.status = 400;
        return next(err);
      }

      // Assign generated product ID to the new product and push it to array
      newProductsArray.push(product);

      // Combine into a new category object
      const newCategoryWithProduct = {
        categoryName,
        categoryID: generatedCategoryId,
        products: newProductsArray,
      };

      // Save the new category with the product
      const newCategory = new Inventory(newCategoryWithProduct);
      await newCategory.save();

      // Send response
      return res.status(200).json({
        message: "New category with the product created",
        data: newCategoryWithProduct,
      });
    } else if (categoryId.slice(0, 4) === "CAT_" && categoryId.length === 16) {
      // Retrieving the category where the product will be pushed
      const category = await Inventory.findOne({ categoryID: categoryId });

      // If invalid category id provided
      if (!category) {
        const err = new Error("Invalid category ID provided!");
        err.status = 400;
        return next(err);
      }

      // Now push the new product
      category.products.push(product);

      // Save the category
      await category.save();

      // Send a response
      return res.status(200).json({
        message: "New product created",
        data: category.toObject(),
      });
    } else {
      const err = new Error(
        `Please provide a correct parameter with the URL. Add the word "new" for a new category or a valid category ID for adding product to an existing category`
      );
      err.status = 400;
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
};

// restock product - function
inventoryFunctions.restockProduct = async (req, res, next) => {
  try {
    const { categoryId, productId } = req.params;
    // First finding the product in the given categoryID
    const inventory = await Inventory.findOne({
      categoryID: categoryId,
      "products.productID": productId,
    });

    // if nor product is found
    if (!inventory) {
      const err = new Error(
        "The request cannot be completed, because categoryID or productID provided does not exist in the Inventory!"
      );
      err.status = 404;
      return next(err);
    }

    // find the product which we will restock
    const productToRestock = inventory.products.find(
      (p) => p.productID === productId
    );

    if (!productToRestock) {
      const err = new Error(
        "The request cannot be completed, because ProductId provided does not exist in the Inventory!"
      );
      err.status = 404;
      return next(err);
    }

    const currentQuantity = productToRestock.stockInfo.currentQuantity;
    const restockThreshold = productToRestock.stockInfo.restockThreshold;
    const restockQuantity = productToRestock.stockInfo.restockQuantity;

    if (currentQuantity > restockThreshold) {
      const err = new Error(
        "The current quantity for this product has not reached below the restock threshold yet! Please update the product's stock info if necessary"
      );
      err.status = 400;
      return next(err);
    }
    // calculate the new quantity
    const newQuantity = currentQuantity + restockQuantity;

    // get the current date
    const currentDate = new Date();

    const updateStock = await Inventory.updateOne(
      {
        categoryID: categoryId,
        "products.productID": productId,
      },
      {
        $set: {
          "products.$.stockInfo.currentQuantity": newQuantity,
          "products.$.stockInfo.lastRestock": currentDate,
          "products.$.stockInfo.stockStatus": "In Stock",
        },
      }
    );

    if (!updateStock) {
      const err = new Error("Error while restocking the product");
      err.status = 500;
      next(err);
    }

    res.status(200).json({
      message: "Product restocked",
      data: {
        categoryId,
        productId,
        currentQuantity: newQuantity,
        lastRestock: currentDate,
      },
    });
  } catch (err) {
    next(err);
  }
};

// get the current inventory report
inventoryFunctions.getInventoryReport = async (req, res, next) => {
  // declare and initialize a session for a transaction
  let session = await mongoose.startSession();
  try {
    session.startTransaction();

    // object to store the compiled inventory report
    const inventoryReport = {};

    // retrieve inventory data for products sold last month
    inventoryReport.lastMonthSoldProducts = await getSoldProductsReport(
      session,
      getDateRange(1)
    );

    // retrieve inventory data from start of the year till current month starting
    inventoryReport.inventoryUpToCurrentMonth = await getSoldProductsReport(
      session,
      getDateRange(new Date().getMonth())
    );

    // get the current quantity of products
    inventoryReport.currentQuantityOfProducts =
      await getCurrentQuantityOfProducts(session);

    // get the 5 top selling products
    inventoryReport.topSellingProducts = await getTopSellingProducts(
      session,
      getDateRange(new Date().getMonth())
    );

    // get low stock products
    inventoryReport.lowStockProducts = await getLowStockProducts(session);

    // console.log(inventoryReport.lastMonthSoldProducts);

    // commit the transaction
    await session.commitTransaction();
    res.status(200).json(inventoryReport);
  } catch (err) {
    await session.abortTransaction();
    next(err); // pass error to the error handler
  } finally {
    await session.endSession();
  }
};

//! Helper functions to gather inventory report

//* generic inventory error function - helper function
function throwInventoryError(
  message = "Error retrieving inventory data",
  code = 500
) {
  const err = new Error(message);
  err.status = code;
  throw err;
}

//* generic date range function - helper function
function getDateRange(valueToSubtract) {
  // making a new date instance. its month will be set by subtracting the given value
  const dateA = new Date();

  // the date will be set up to the intended month and that month's starting date
  dateA.setMonth(dateA.getMonth() - valueToSubtract);
  dateA.setDate(1);
  dateA.setHours(0, 0, 0, 0);

  // setting up another date instance so it will reflect the current months first day
  const dateB = new Date();
  dateB.setDate(1);
  dateB.setHours(0, 0, 0, 0);

  return [dateA, dateB];
}

//* generic function to gather inventory report on sold products - helper function
async function getSoldProductsReport(session, dateArr) {
  try {
    // using aggregation pipeline to accumulate data
    const productReport = await Orders.aggregate([
      {
        $match: {
          orderStatus: "completed", // only completed Orders will be taken
          orderDate: {
            $gte: dateArr[0],
            $lt: dateArr[1],
          }, // orders within the given range will be accumulated
        },
      },
      {
        $unwind: "$items", // Break down the 'items' array so each product becomes a document
      },
      {
        $group: {
          _id: "$items.productID", // If multiple orders contain the same productID, they will be grouped together.
          productName: { $first: "$items.productName" }, // Since productID uniquely identifies a product, the productName will be the same for all documents in that group. Using 'first' is a convenient way to just grab the productName from the first document
          totalQuantitySold: { $sum: "$items.quantity" },
          imageUrl: { $first: "$items.imageUrl" },
        },
      },
      {
        $project: {
          _id: 0, // no need mongoDB's default id
          productID: "$_id", // renaming the id field
          productName: 1,
          totalQuantitySold: 1,
          imageUrl: 1,
        },
      },
    ]).session(session); // adding this transaction to the part of the session

    // Calculating the total product sales for that month
    const totalProductsSold = productReport.reduce(
      (total, product) => total + product.totalQuantitySold,
      0
    );

    // Get the starting month's name
    const startMonth = new Date(dateArr[0]).toLocaleString("default", {
      month: "long",
    });

    // Get the ending month's name
    const endMonth = new Date(dateArr[1]).toLocaleString("default", {
      month: "long",
    });

    // return the overall report
    return {
      products: productReport,
      totalProductsSold,
      startMonth,
      endMonth,
    };
  } catch (err) {
    console.log("Error while gathering sold product's report: ", err);
    throwInventoryError("Error while gathering sold product's report");
  }
}

//* get the current quantity of each product - helper function
async function getCurrentQuantityOfProducts(session) {
  try {
    const currentQuantityReport = await Inventory.aggregate([
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: "$categoryName",
          products: {
            $push: {
              productName: "$products.productName",
              currentQuantity: "$products.stockInfo.currentQuantity",
              imageUrl: "$products.imageUrl",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          categoryName: "$_id",
          products: 1,
        },
      },
    ]).session(session);

    return currentQuantityReport;
  } catch (err) {
    console.log("Error while gathering current quantity of products: ", err);
    throwInventoryError("Error while gathering current quantity of products");
  }
}

//* get the top selling products - helper function
async function getTopSellingProducts(session, dateArr) {
  try {
    const topSellingProducts = await Orders.aggregate([
      // Step 1, match the orders from the this years and with the status completed
      {
        $match: {
          orderStatus: "completed",
          orderDate: {
            $gte: dateArr[0],
            $lte: new Date(),
          },
        },
      },
      // Step 2, Unwind the items array so that each product gets it own document
      {
        $unwind: "$items",
      },
      // Step 3: Group by productID and calculate total quantity sold
      {
        $group: {
          _id: "$items.productID",
          totalQuantitySold: {
            $sum: "$items.quantity",
          },
        },
      },
      // Step 4: Lookup to inventory to get product details like name, category, and imageUrl
      {
        $lookup: {
          from: "inventory",
          let: { productId: "$_id" },
          pipeline: [
            { $unwind: "$products" },
            {
              $match: {
                $expr: { $eq: ["$products.productID", "$$productId"] },
              },
            },
            {
              $project: {
                productName: "$products.productName",
                categoryName: "$categoryName",
                imageUrl: "$products.imageUrl",
              },
            },
          ],
          as: "productDetails",
        },
      },
      // Step 5: Flatten the product details
      {
        $unwind: "$productDetails",
      },
      // Step 6: Sort by totalQuantitySold in descending order
      {
        $sort: {
          totalQuantitySold: -1,
        },
      },
      // Step 7: Limit to top 5 products
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          productID: "$_id",
          productName: "$productDetails.productName",
          categoryName: "$productDetails.categoryName",
          imageUrl: "$productDetails.imageUrl",
          totalQuantitySold: 1,
        },
      },
    ]);
    return topSellingProducts;
  } catch (err) {
    console.log("Error while getting top selling products", err);
    throwInventoryError("Error while getting top selling products");
  }
}

//* get low stock products - helper function
async function getLowStockProducts(session) {
  try {
    const lowStockProducts = await Inventory.aggregate([
      // Step 1: Unwind the products array to work with each product individually
      {
        $unwind: "$products",
      },
      // Step 2: Match products with both conditions, low stock and quantity less then or equal to re stock threshold
      {
        $match: {
          // "products.stockInfo.stockStatus": "Low Stock",
          $expr: {
            $lt: [
              "$products.stockInfo.currentQuantity",
              "$products.stockInfo.restockThreshold",
            ],
          },
        },
      },
      // Step 3: Project the necessary fields and extracting only the date part of lastRestock
      {
        $project: {
          _id: 0,
          categoryID: 1,
          productID: "$products.productID",
          currentQuantity: "$products.stockInfo.currentQuantity",
          restockQuantity: "$products.stockInfo.restockQuantity",
          lastRestock: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $toDate: "$products.stockInfo.lastRestock" },
            },
          },
        },
      },
    ]).session(session);

    return lowStockProducts;
  } catch (err) {
    console.log("Error while gathering low stock products: ", err);
    throwInventoryError("Error while gathering low stock products");
  }
}

// Exporting the inventoryFunction object
module.exports = inventoryFunctions;
