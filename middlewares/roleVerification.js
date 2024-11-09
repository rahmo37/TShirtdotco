// This middleware verifies user's role (Admin, Employee, Customer)

// Object to accumulate functions
const roleVerify = {};

roleVerify.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    const err = new Error("You do not have permissions to perform this action!");
    err.status = 403;
    return next(err);
  }
  next();
};

roleVerify.isEmployee = (req, res, next) => {
  if (!req.user || !req.user.id || !req.user.id.startsWith("EMP_")) {
    const err = new Error("You are not authorized to access this resource!");
    err.status = 403;
    return next(err);
  }
  next();
};

module.exports = roleVerify;
