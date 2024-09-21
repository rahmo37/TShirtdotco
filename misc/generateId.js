const crypto = require("crypto");

// Function that generates random id
function generateId(prefix) {
  return prefix + crypto.randomBytes(6).toString("hex");
}

module.exports = generateId;
