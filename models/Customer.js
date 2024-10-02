/**
 * Customer and Order models
 */

// import packages
const mongoose = require("mongoose");

// creating schema instance
const Schema = mongoose.Schema;

// customer schema
const customerSchema = new Schema(
  {
    customerID: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    password: { type: String, required: true, select: false },
    customerBio: {
      firstName: String,
      lastName: String,
      address: {
        street: String,
        city: String,
        country: String,
      },
      gender: String,
    },
    accountCreated: { type: Date, required: true },
    accountStatus: { type: String, required: true },
  },
  { collection: "customers" }
);

// creating a customer model using the schema
const Customer = mongoose.model("Customers", customerSchema);

module.exports = Customer;
