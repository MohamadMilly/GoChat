const express = require("express");

const usersRouter = express.Router();

const usersController = require("../controllers/usersController");

const verifyToken = require("../middlewares/verifyToken");

const prisma = require("../lib/prisma");

const jwt = require("jsonwebtoken");

require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;
// general resources (no authentication is required)

// private resources (for specific users)
usersRouter.use(verifyToken, async (req, res, next) => {
  const token = req.token;
  let currentUser;
  try {
    const authData = jwt.verify(token, SECRET_KEY);
    const user = authData.user;
    req.currentUser = user;
    currentUser = user;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  } finally {
    if (currentUser) {
      await prisma.$executeRawUnsafe(
        `SET LOCAL app.current_user_id = '${currentUser.id}';`,
      );
    }
  }
});

usersRouter.get("/me/conversations", usersController.myConversationsGet);
usersRouter.get("/", usersController.queryUsersGet);
usersRouter.get("/me/contacts", usersController.getMyContactsGet);
usersRouter.get("/me/profile", usersController.getCurrentUserGet);
usersRouter.get("/me/preferences", usersController.getCurrentuserPreferences);
usersRouter.patch("/me/preferences", usersController.preferencesPatch);
usersRouter.put("/me/profile", usersController.editProfilePut);
usersRouter.delete("/me", usersController.deleteAccountDelete);
usersRouter.patch("/me", usersController.editUserPatch);
usersRouter.get("/:userId", usersController.getSpecificUserGet);
module.exports = usersRouter;
