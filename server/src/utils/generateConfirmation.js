const crypto = require("crypto");

module.exports = function generateConfirmation() {
  return `EVT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};
