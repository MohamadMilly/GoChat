const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const authRouter = express.Router();

const authController = require("../controllers/authController");

authRouter.post("/login", authController.loginPost);
authRouter.post("/login/verification", authController.verifyPost);
authRouter.post("/signup", authController.signupPost);

authRouter.use(verifyToken, (req, res, next) => {
  const token = req.token;
  try {
    const authData = jwt.verify(token, SECRET_KEY);
    const user = authData.user;
    req.currentUser = user;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
});
authRouter.patch("/me/password", authController.changePasswordPatch);

module.exports = authRouter;
