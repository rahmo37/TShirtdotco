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

saleFunctions.getCustomSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    if (
      !startDate ||
      !endDate ||
      Object.keys(startDate).length === 0 ||
      Object.keys(startDate).length === 0
    ) {
      const err = new Error("You must provide start and end dates");
      err.status = 400;
      return next(err);
    }

    for (let key of Object.keys(startDate)) {
      const convertedValue = checkAndConvertToNumber(startDate[key]);
      if (convertedValue === false) {
        const err = new Error(
          "Invalid value provided for the start date field: " + key
        );
        err.status = 400;
        return next(err);
      }
      startDate[key] = convertedValue;
    }

    for (let key of Object.keys(endDate)) {
      const convertedValue = checkAndConvertToNumber(endDate[key]);
      if (convertedValue === false) {
        const err = new Error(
          "Invalid value provided for the end date field: " + key
        );
        err.status = 400;
        return next(err);
      }
      endDate[key] = convertedValue;
    }

    const dateA = currentNewYorkDateTime();
    dateA.setDate(startDate.day === 31 ? 30 : startDate.day);
    dateA.setMonth(startDate.month - 1);
    dateA.setFullYear(startDate.year);

    const dateB = currentNewYorkDateTime();
    dateB.setDate(endDate.day === 31 ? 30 : endDate.day);
    dateB.setMonth(endDate.month - 1);
    dateB.setFullYear(endDate.year);

    console.log(dateB);

    const checkDateA = new Date(
      Date.UTC(startDate.year, startDate.month - 1, startDate.day)
    );
    const checkDateB = new Date(
      Date.UTC(endDate.year, endDate.month - 1, endDate.day)
    );

    if (checkDateA.getTime() >= checkDateB.getTime()) {
      const err = new Error(
        "The start date must be earlier than the end date."
      );
      err.status = 400;
      return next(err);
    }

    const customSaleReport = await getTotalSale(null, [dateA, dateB]);

    console.log(customSaleReport);

    res.status(200).json({
      message: "Custom Sale Report Included",
      data: {
        customSaleReport,
      },
    });
  } catch (err) {
    next(err);
  }
};

//! Helper functions to gather sales report

//* Generic sale error function - helper function
function throwSaleError(message = "Error retrieving sales data", code = 500) {
  const err = new Error(message);
  err.status = code;
  throw err;
}

//* Checks the dates and converts to number if necessary
function checkAndConvertToNumber(value) {
  // Check if the value is a string that can be converted to a valid number
  if (typeof value === "string") {
    value = value.trim();
    if (value === "" || isNaN(Number(value))) {
      return false; // Invalid string input
    }
    return Number(value); // Convert valid string to number
  }

  // If the value is already a number, return it
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }

  // If it's neither a valid number nor a convertible string, return false
  return false;
}

//* Generic date range function - helper function
function getDateRange(valueToSubtract) {
  // making a new date instance. its month will be set by subtracting the given value
  const dateA = currentNewYorkDateTime();

  // the date will be set up to the intended month and that month's starting date
  dateA.setMonth(dateA.getMonth() - valueToSubtract);
  dateA.setDate(1);
  dateA.setHours(23, 59, 59, 999);
  dateA.setFullYear(2024);

  // setting up another date instance so it will reflect the current months first day
  const dateB = currentNewYorkDateTime();
  dateB.setHours(23, 59, 59, 999);

  return [dateA, dateB];
}

//* Function to gather total sales by date range - helper function
async function getTotalSale(session, dateArr) {
  try {
    // Using aggregation pipeline to accumulate data per month
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
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
          },
          monthlyRevenue: { $sum: "$grandTotal" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          monthlyRevenue: { $round: ["$monthlyRevenue", 2] },
        },
      },
    ]).session(session);

    // Generate list of all months in the given date range
    const monthsInRange = [];
    const start = new Date(dateArr[0].getFullYear(), dateArr[0].getMonth(), 1);
    const end = new Date(dateArr[1].getFullYear(), dateArr[1].getMonth(), 1);

    let current = new Date(start);
    while (current <= end) {
      monthsInRange.push({
        month: current.getMonth() + 1, // getMonth() returns 0-11
        year: current.getFullYear(),
      });
      current.setMonth(current.getMonth() + 1);
    }

    // Merge the totalSales with monthsInRange to include months with zero sales
    const monthlySales = monthsInRange.map((dateObj) => {
      const sale = totalSales.find(
        (item) => item.month === dateObj.month && item.year === dateObj.year
      );

      const revenue = sale ? sale.monthlyRevenue : 0;
      const revenueFixed = parseFloat(revenue.toFixed(2));

      const monthName = new Date(
        dateObj.year,
        dateObj.month - 1
      ).toLocaleString("default", {
        month: "long",
      });

      return {
        month: monthName,
        year: dateObj.year,
        revenue: revenueFixed,
      };
    });

    // Fetch all completed orders within the date range
    const orders = await Order.find({
      orderStatus: "completed",
      orderDate: {
        $gte: dateArr[0],
        $lt: dateArr[1],
      },
    })
      .select("orderID orderDate grandTotal")
      .sort({ orderDate: 1 }) // Optional: sort by orderDate ascending
      .session(session);

    // Function to format the date with day suffix
    function formatDateWithSuffix(date) {
      const day = date.getDate();
      const daySuffix = getDaySuffix(day);
      const monthName = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      return `${monthName} ${day}${daySuffix}, ${year}`;
    }

    function getDaySuffix(day) {
      if (day >= 11 && day <= 13) {
        return "th";
      }
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }

    // Format the orders with formatted date and grandTotal
    const formattedOrders = orders.map((order) => {
      const formattedDate = formatDateWithSuffix(order.orderDate);
      return {
        orderID: order.orderID || order._id.toString(), // Use orderID if available, otherwise _id
        orderDate: formattedDate,
        grandTotal: Number(order.grandTotal.toFixed(2)),
      };
    });

    // Calculate the total revenue across all months
    const totalRevenue = parseFloat(
      monthlySales.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)
    );

    // Get the starting and ending month's names for the summary
    const startMonth = dateArr[0].toLocaleString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const endMonth = dateArr[1].toLocaleString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return {
      totalRevenue,
      monthlySales,
      orders: formattedOrders,
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
                "products.imageUrl": 1,
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
            imageUrl: "$productCategory.products.imageUrl",
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
              imageUrl: "$_id.imageUrl",
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

    const startMonth = dateArr[0].toLocaleString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const endMonth = dateArr[1].toLocaleString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

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
          gender: "$customerInfo.customerBio.gender",
          totalSales: 1,
          orderCount: 1,
        },
      },
    ]).session(session);

    // Apply toFixed(2) to each customer's total sales
    totalSalesPerCustomer.forEach((customer) => {
      customer.totalSales = Number(customer.totalSales.toFixed(2));
    });

    const startMonth = dateArr[0].toLocaleString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const endMonth = dateArr[1].toLocaleString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

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
