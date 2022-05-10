const jwt = require("jsonwebtoken");

// middleware to validate token
const checkToken = (req) => {
  const authHeader = req.headers.authorization
  const token = authHeader.split(" ")[1]

  return token
}

module.exports = checkToken;