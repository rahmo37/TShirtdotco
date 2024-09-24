// This file handles the not found error
module.exports = (req, res, next) => {
  const err = new Error("Requested url not found!");
  err.status = 404;
  next(err);
};
