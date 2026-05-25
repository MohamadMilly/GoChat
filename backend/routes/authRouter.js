const express = require("express");
const extractToken = require("../middlewares/auth/extractToken");
const verifyToken = require("../middlewares/auth/verifyToken");

const authRouter = express.Router();

const authController = require("../controllers/authController");
const validateSignUp = require("../middlewares/auth/validateSignUp");

authRouter.post("/login", authController.loginPost);
authRouter.post("/signup", validateSignUp, authController.signupPost);

authRouter.use(extractToken);
authRouter.use(verifyToken);

authRouter.patch("/me/password", authController.changePasswordPatch);

module.exports = authRouter;
