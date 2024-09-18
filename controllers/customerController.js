/**
 * Customer Authentication Controller
 * This is the file where the authentication logic is implemented for customer
 */

// Importing Modules
const Customer = require("../models/Customer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");

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

    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      const err = new Error("Invalid email or password");
      err.status = 404;
      return next(err);
    }

    // Generate JWT token
    const payload = {
      id: customer._id,
      email: customer.email,
      role: "customer",
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    // Deleting password before sending
    const customerData = customer.toObject(); // to pure js object
    delete customerData.password;

    // Sending response
    res.status(200).json({
      user: customerData,
      token,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
};
