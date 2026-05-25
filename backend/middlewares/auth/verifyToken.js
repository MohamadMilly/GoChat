const { verify } = require("../../services/auth/utils/jwt");
const HttpError = require("../../shared/errors/HttpError");

function verifyToken(req, res, next) {
  try {
    const token = req.token;
    if (!token) {
      throw new HttpError("Authentication token required", 401);
    }
    const authData = verify(token);
    if (authData) {
      req.currentUser = authData.user;
    }
    next();
  } catch (err) {
    if (!err.status) {
      err.status = 401;
    }
    next(err);
  }
}

module.exports = verifyToken;
