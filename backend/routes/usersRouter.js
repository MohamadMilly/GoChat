const express = require("express");

const usersRouter = express.Router();

const usersController = require("../controllers/usersController");

const verifyToken = require("../middlewares/verifyToken");

const jwt = require("jsonwebtoken");

require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;
// general resources (no authentication is required)

usersRouter.get("/:userId", usersController.getSpecificUserGet);

// private resources (for specific users)
usersRouter.use(verifyToken, (req, res, next) => {
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

usersRouter.get("/me/conversations", usersController.myConversationsGet);
usersRouter.get("/", usersController.queryUsersGet);
usersRouter.get("/me/contacts", usersController.getMyContactsGet);

// usersRouter.put("/me/profile");

module.exports = usersRouter;
