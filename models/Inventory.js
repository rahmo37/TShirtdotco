const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the stock info schema for better clarity and reuse
const stockInfoSchema = new Schema({
  currentQuantity: Number,
  totalSold: Number,
  restockThreshold: Number,
  lastRestock: Date,
  restockQuantity: Number,
  stockStatus: String,
});

// Define the product schema
const productSchema = new Schema({
  productID: String,
  productName: String,
  productDescription: String,
  unitPrice: Number,
  stockInfo: stockInfoSchema, // Embedding stock info
  imageUrl: String,
  dateAdded: Date,
  color: String,
});

// Define the category schema, which embeds products
const categorySchema = new Schema({
  categoryID: String,
  categoryName: String,
  products: [productSchema], // Array of products
});

// Create and export the models
const Inventory = mongoose.model("Inventory", categorySchema);

module.exports = { Inventory };
