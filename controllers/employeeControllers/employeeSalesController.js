// This module handles all the sales related operations

// Importing the modules
const Order = require("../../models/Order");

// This object gathers all the sales related function
const saleFunctions = {};

saleFunctions.salesReport = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "Sales report included",
      data: {},
    });
  } catch (err) {
    return next(err);
  }
};

// module export
module.exports = saleFunctions;
