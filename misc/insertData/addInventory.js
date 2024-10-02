// Import necessary modules
const mongoose = require("mongoose");
const fs = require("fs");
const Inventory = require("../../models/Inventory");

// Connect to MongoDB using environment variable URL
mongoose
  .connect(
    "mongodb+srv://rahmo:BMH7ftE9r2kuCCWN@erpsyetem.4gb74.mongodb.net/ERPDatabase?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// Function to insert inventory from a file
const insertInventory = async () => {
  try {
    // Read inventory data from JSON file
    const inventoryData = fs.readFileSync(
      "../json/ERPDatabase_Updated.inventory.json",
      "utf8"
    );
    const inventory = JSON.parse(inventoryData);

    // Insert inventory data into MongoDB
    await Inventory.insertMany(inventory);

    console.log("Inventory data successfully inserted!");
  } catch (err) {
    console.log("Error inserting inventory data: ", err);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
  }
};

// Run the function to insert inventory
insertInventory();
