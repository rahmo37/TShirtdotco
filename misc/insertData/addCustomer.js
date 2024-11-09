// Import necessary modules
const mongoose = require("mongoose");
const fs = require("fs");
const Customer = require("../../models/Customer");

// Connect to MongoDB using environment variable URL
mongoose
  .connect(
    "mongodb+srv://rahmo:BMH7ftE9r2kuCCWN@erpsyetem.4gb74.mongodb.net/ERPDatabase?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// Function to insert customers from a file
const insertCustomers = async () => {
  try {
    // Read customers data from JSON file
    const customerData = fs.readFileSync(
      "../../json/cus.json",
      "utf8"
    );
    const customers = JSON.parse(customerData);

    // Insert customers data into MongoDB
    await Customer.insertMany(customers);

    console.log("Customers data successfully inserted!");
  } catch (err) {
    console.log("Error inserting Customers data: ", err);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
  }
};

// Run the function to insert Customers
insertCustomers();
