// This module handles all the sales-related operations

// Importing the modules
const Order = require("../../models/Order");
const mongoose = require("mongoose");
const currentNewYorkDateTime = require("../../misc/getNewYorkDateAndTime");

// This object gathers all the sales-related functions
const saleFunctions = {};

saleFunctions.salesReport = async (req, res, next) => {
  let session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Object to store the compiled sales report
    const salesReport = {};

    // Retrieve sales data for the last month
    salesReport.salesLastMonth = await getTotalSale(session, getDateRange(1));

    // Retrieve sales data from the start of the year up to the current month starting
    salesReport.salesUptoCurrentMonth = await getTotalSale(
      session,
      getDateRange(currentNewYorkDateTime().getMonth())
    );

    // Get sales of each product by their category
    salesReport.salesOfEachProduct = await getSalesOfEachProduct(
      session,
      getDateRange(currentNewYorkDateTime().getMonth())
    );

    // Get sales by each customer
    salesReport.saleByEachCustomer = await getSaleByEachCustomer(
      session,
      getDateRange(currentNewYorkDateTime().getMonth())
    );

    // Commit the session
    await session.commitTransaction();

    // Return the response
    res.status(200).json({
      message: "Sales report included",
      data: { salesReport },
    });
  } catch (err) {
    await session.abortTransaction();
    return next(err);
  } finally {
    session.endSession();
  }
};

//! Helper functions to gather sales report

//* Generic sale error function - helper function
function throwSaleError(message = "Error retrieving sales data", code = 500) {
  const err = new Error(message);
  err.status = code;
  throw err;
}

//* Generic date range function - helper function
function getDateRange(valueToSubtract) {
  // Create a new date instance and subtract the given number of months
  const dateA = currentNewYorkDateTime();
  dateA.setMonth(dateA.getMonth() - valueToSubtract);
  dateA.setDate(1);
  dateA.setHours(0, 0, 0, 0);

  // Create another date instance for the current month's first day
  const dateB = currentNewYorkDateTime();
  dateB.setDate(1);
  dateB.setHours(0, 0, 0, 0);

  return [dateA, dateB];
}

//* Function to gather total sales by date range - helper function
async function getTotalSale(session, dateArr) {
  try {
    // Using aggregation pipeline to accumulate data
    const totalSales = await Order.aggregate([
      {
        $match: {
          orderStatus: "completed", // Only completed orders
          orderDate: {
            $gte: dateArr[0],
            $lt: dateArr[1],
          },
        },
      },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: "$grandTotal" },
        },
      },
      {
        $project: {
          _id: 0,
          grossRevenue: 1,
        },
      },
    ]).session(session);

    let grossRevenue = 0;
    if (totalSales.length > 0) {
      grossRevenue = Number(totalSales[0].grossRevenue.toFixed(2));
    }

    // Get the starting and ending month's names
    const startMonth = dateArr[0].toLocaleString("default", { month: "long" });
    const endMonth = dateArr[1].toLocaleString("default", { month: "long" });

    return {
      grossRevenue,
      startMonth,
      endMonth,
    };
  } catch (err) {
    console.error("Error while gathering total sales: ", err);
    throwSaleError("Error while gathering total sales");
  }
}

//* Function to gather sales report based on each product and their category - helper function
async function getSalesOfEachProduct(session, dateArr) {
  try {
    const productRevenueByCategory = await Order.aggregate([
      {
        $match: {
          orderStatus: "completed",
          orderDate: {
            $gte: dateArr[0],
            $lt: dateArr[1],
          },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "inventory",
          let: { productID: "$items.productID" },
          pipeline: [
            { $unwind: "$products" },
            {
              $match: {
                $expr: { $eq: ["$products.productID", "$$productID"] },
              },
            },
            {
              $project: {
                categoryName: 1,
                "products.productName": 1,
                "products.productID": 1,
              },
            },
          ],
          as: "productCategory",
        },
      },
      {
        $unwind: "$productCategory",
      },
      {
        $group: {
          _id: {
            categoryName: "$productCategory.categoryName",
            productName: "$productCategory.products.productName",
          },
          productRevenue: { $sum: "$items.subtotal" },
        },
      },
      {
        $group: {
          _id: "$_id.categoryName",
          products: {
            $push: {
              productName: "$_id.productName",
              productRevenue: "$productRevenue",
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

    // Apply toFixed(2) to each product's revenue
    productRevenueByCategory.forEach((category) => {
      if (category.products && category.products.length > 0) {
        category.products.forEach((product) => {
          product.productRevenue = Number(product.productRevenue.toFixed(2));
        });
      }
    });

    const startMonth = dateArr[0].toLocaleString("default", { month: "long" });
    const endMonth = dateArr[1].toLocaleString("default", { month: "long" });

    return {
      productRevenueByCategory,
      startMonth,
      endMonth,
    };
  } catch (err) {
    console.error("Error while gathering product sales: ", err);
    throwSaleError("Error while gathering product sales");
  }
}

//* Function to gather sales report based on each customer - helper function
async function getSaleByEachCustomer(session, dateArr) {
  try {
    const totalSalesPerCustomer = await Order.aggregate([
      {
        $match: {
          orderStatus: "completed",
          orderDate: {
            $gte: dateArr[0],
            $lt: dateArr[1],
          },
        },
      },
      {
        $group: {
          _id: "$customerID",
          totalSales: { $sum: "$grandTotal" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "customerID",
          as: "customerInfo",
        },
      },
      {
        $unwind: "$customerInfo",
      },
      {
        $project: {
          _id: 0,
          firstName: "$customerInfo.customerBio.firstName",
          lastName: "$customerInfo.customerBio.lastName",
          totalSales: 1,
          orderCount: 1,
        },
      },
    ]).session(session);

    // Apply toFixed(2) to each customer's total sales
    totalSalesPerCustomer.forEach((customer) => {
      customer.totalSales = Number(customer.totalSales.toFixed(2));
    });

    const startMonth = dateArr[0].toLocaleString("default", { month: "long" });
    const endMonth = dateArr[1].toLocaleString("default", { month: "long" });

    return {
      totalSalesPerCustomer,
      startMonth,
      endMonth,
    };
  } catch (err) {
    console.error("Error while gathering customer sales: ", err);
    throwSaleError("Error while gathering customer sales");
  }
}

// Module export
module.exports = saleFunctions;
