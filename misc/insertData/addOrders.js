// Import necessary modules
const mongoose = require("mongoose");
const fs = require("fs");
const Order = require("../../models/Order");

// Connect to MongoDB using environment variable URL
mongoose
  .connect(
    "mongodb+srv://rahmo:BMH7ftE9r2kuCCWN@erpsyetem.4gb74.mongodb.net/ERPDatabase?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// Function to insert orders from a file
const insertOrders = async () => {
  try {
    // Read orders data from JSON file
    const orderData = fs.readFileSync(
      "../../json/ord.json",
      "utf8"
    );
    const orders = JSON.parse(orderData);

    // Insert orders data into MongoDB
    await Order.insertMany(orders);

    console.log("Orders data successfully inserted!");
  } catch (err) {
    console.log("Error inserting orders data: ", err);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
  }
};

// Run the function to insert orders
insertOrders();
