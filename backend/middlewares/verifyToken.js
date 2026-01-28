function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    return res.status(403).json({
      message: "You are not authorized to do this action",
    });
  }
  const bearer = bearerHeader.split(" ");
  const bearerToken = bearer[1];
  req.token = bearerToken;

  next();
}

module.exports = verifyToken;
