require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");
const HttpError = require("../../../shared/errors/HttpError");

function sign(payload) {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "14d" });
  return token;
}

function verify(token) {
  return jwt.verify(token, SECRET_KEY);
}

module.exports = { sign, verify };
