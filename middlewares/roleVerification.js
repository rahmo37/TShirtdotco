// This middleware verifies user's role (Admin, Employee, Customer)

// Object to accumulate functions
const roleVerify = {};

roleVerify.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    const err = new Error("Not enough permission!");
    err.status = 403;
    return next(err);
  }
  next();
};

module.exports = roleVerify;
