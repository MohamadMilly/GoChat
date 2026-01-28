const express = require("express");

const authRouter = express.Router();

const authController = require("../controllers/authController");

authRouter.post("/login", authController.loginPost);
authRouter.post("/login/verification", authController.verifyPost);
authRouter.post("/signup", authController.signupPost);

module.exports = authRouter;
