const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the stock info schema for better clarity and reuse
const stockInfoSchema = new Schema({
  currentQuantity: { type: Number, required: true },
  totalSold: { type: Number, required: true },
  restockThreshold: { type: Number, required: true },
  lastRestock: { type: Date, required: true },
  restockQuantity: { type: Number, required: true },
  stockStatus: { type: String, required: true},
});

// Define the product schema
const productSchema = new Schema({
  productID: { type: String, required: true, unique: true },
  productName: { type: String, required: true, unique: true },
  productDescription: { type: String, required: true, unique: true },
  unitPrice: { type: Number, required: true },
  stockInfo: stockInfoSchema, // Embedding stock info
  imageUrl: String,
  dateAdded: { type: Date, required: true },
  color: String,
});

// Define the category schema, which embeds products
const categorySchema = new Schema(
  {
    categoryID: String,
    categoryName: String,
    products: [productSchema], // Array of products
  },
  { collection: "inventory" }
);

// Create and export the models
const Inventory = mongoose.model("Inventory", categorySchema);

module.exports = Inventory;
