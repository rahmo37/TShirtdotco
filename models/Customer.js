/**
 * Customer and Order models
 */

// import packages
const mongoose = require("mongoose");

// creating schema instance
const Schema = mongoose.Schema;

/**
 * defining order schema as a separate schema, so it can be used individually
 */

// order schema
const orderSchema = new Schema({
  orderId: Number,
  orderStatus: String,
  item: String,
  quantity: Number,
  priceInfo: {
    unitePrice: Number,
    subTotal: Number,
    tax: Number,
    totalPrice: Number,
  },
});

// customer schema
const customerSchema = new Schema(
  {
    customerID: Number,
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
    orders: { type: [orderSchema], default: [] }, // adding order schema as a sub-document
  },
  { collection: "customers" }
);

// creating a customer model using the schema
const Customer = mongoose.model("Customers", customerSchema);

module.exports = Customer;
