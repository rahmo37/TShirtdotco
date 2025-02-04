/**
 * Customer Authentication Controller
 * This is the file where the authentication logic is implemented for customer
 */

// Importing Modules
const Customer = require("../../models/Customer");
const Order = require("../../models/Order");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../../config/jwtConfig");

// login function
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email }).select("+password"); // asking for the password explicitly

    if (!customer) {
      const err = new Error("Customer not found!");
      err.status = 404;
      return next(err);
    }

    if (customer.accountStatus != "Active") {
      const err = new Error("This account is currently frozen!");
      err.status = 404;
      return next(err);
    }

    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      return next(err);
    }

    const orders = await Order.find({
      customerID: customer.customerID,
    });

    // Generate payload to be signed by JT
    const userPayload = {
      id: customer.customerID,
      email: customer.email,
      role: "customer",
    };

    // JWT Signature
    const token = jwt.sign(userPayload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    // Deleting password before sending
    const customerData = customer.toObject(); // to pure js object
    delete customerData.password;

    // Sending response
    res.status(200).json({
      message: "User validated",
      user: customerData,
      orders,
      token,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
};
