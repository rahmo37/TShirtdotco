// This file verifies Json Web Token

// Importing Module
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");

// Middleware function that checks for Json Web Token
const authenticateToken = (req, res, next) => {
  // Getting the bearer and the token from the header
  const authHeader = req.headers["authorization"];

  // splitting the token
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    const err = new Error("Missing token... you need an authorization token to complete this action");
    err.status = 403;
    return next(err);
  }

  // now we verify the token
  jwt.verify(token, jwtConfig.secret, (err, user) => {
    if (err) {
      err.status = 403;
      err.message = "Invalid token and signature";
      return next(err);
    }

    // If verified, attach the user info to the req object to be used by the next middle ware
    req.user = user;

    // call next middleware
    next();
  });
};

// export the module
module.exports = authenticateToken;
