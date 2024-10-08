// Employee Model
const mongoose = require("mongoose");

// creating schema instance
const Schema = mongoose.Schema;

const employeeSchema = new Schema(
  {
    employeeID: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // by default the password is hidden, but if asked explicitly, it will be provided
    phone: String,
    lastLogin: { type: Date, default: null},
    isAdmin: { type: Boolean, default: false },
    employeeBio: {
      firstName: String,
      lastName: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      gender: String,
    },
    workInfo: {
      jobTitle: String,
      employeeType: String,
      hireDate: { type: Date, required: true },
      payFrequency: String,
      payAmount: {
        baseSalary: Number,
        bonus: Number,
      },
      department: String,
      workingHours: {
        startTime: String,
        endTime: String,
      },
    },
    accountCreated: { type: Date, required: true },
    accountStatus: { type: String, required: true },
  },
  { collection: "employees" }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
