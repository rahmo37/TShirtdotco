// Import necessary modules
const mongoose = require("mongoose");
const fs = require("fs");
const Employee = require("../../models/Employee");

// Connect to MongoDB using environment variable URL
mongoose
  .connect(
    "mongodb+srv://rahmo:BMH7ftE9r2kuCCWN@erpsyetem.4gb74.mongodb.net/ERPDatabase?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// Function to insert employees from a file
const insertEmployees = async () => {
  try {
    // Read employee data from JSON file
    const employeeData = fs.readFileSync("../../json/emp.json", "utf8");
    const employees = JSON.parse(employeeData);

    // Insert employee data into MongoDB
    await Employee.insertMany(employees);

    console.log("Employee data successfully inserted!");
  } catch (err) {
    console.log("Error inserting employee data: ", err);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
  }
};

// Run the function to insert employees
insertEmployees();
