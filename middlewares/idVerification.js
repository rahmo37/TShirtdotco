// This module checks if the passed in Id matches the id used to sign in the token
module.exports = (req, res, next) => {
  // TODO Delete later or uncomment to log the ids
  // console.log(req.user.id, req.params.id);
  if (req.user.id === req.params.id) {
    return next();
  } else {
    const err = new Error(
      "Invalid ID provided. The ID must match the currently logged-in user."
    );
    err.status = 403;
    return next(err);
  }
};
