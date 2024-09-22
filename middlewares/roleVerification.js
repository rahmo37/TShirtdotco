// This middleware verifies user's role (Admin, Employee, Customer)

// Object to accumulate functions
const roleVerify = {};

roleVerify.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    const err = new Error(
      "Access denied! You do not have the necessary permissions to view this resource"
    );
    err.status = 403;
    return next(err);
  }
  next();
};

module.exports = roleVerify;
