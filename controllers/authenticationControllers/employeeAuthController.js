/**
 * Employee Authentication Controller
 * This is the file where the authentication logic is implemented for employee/admin
 */

// Importing Modules
const Employee = require("../../models/Employee");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../../config/jwtConfig");
const newYorkDateAndTime = require("../../misc/getNewYorkDateAndTime");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email }).select("+password");

    if (!employee) {
      const err = new Error("Employee not found");
      err.status = 404;
      return next(err);
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      return next(err);
    }

    if (employee.accountStatus != "Active") {
      const err = new Error("This account is currently closed!");
      err.status = 404;
      return next(err);
    }

    // update the the last login field
    employee.lastLogin = newYorkDateAndTime();
    // save the time
    await employee.save();

    // creating a payload that will be sent with the token
    const userPayload = {
      id: employee.employeeID,
      email: employee.email,
      role: employee.isAdmin ? "admin" : "employee",
    };

    const token = jwt.sign(userPayload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    const employeeData = employee.toObject();
    delete employeeData.password;

    res.status(200).json({
      message: "User validated",
      user: employeeData,
      token,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { login };
