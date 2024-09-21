const mongoose = require("mongoose");

// Define the schema for individual product details
const productSchema = new mongoose.Schema({
  productID: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  initialQuantity: { type: Number, required: true },
  currentQuantity: { type: Number, required: true },
  totalSold: { type: Number, required: true },
  imageUrl: { type: String },
  stockStatus: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  color: { type: String },
});

// Define the schema for inventory, which embeds the products
const inventorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  products: [productSchema], // Embeds an array of products
});

// Create the Mongoose model
const Inventory = mongoose.model("inventory", inventorySchema);

module.exports = Category;
