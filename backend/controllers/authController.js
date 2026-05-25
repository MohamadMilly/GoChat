const jwt = require("jsonwebtoken");

const { validationResult, matchedData } = require("express-validator");

// import enviroment variables
require("dotenv").config();

const prisma = require("../lib/prisma");
const authService = require("../services/auth/authService");
const conversationService = require("../services/conversation/conversationService");
const { sign } = require("../services/auth/utils/jwt");

// pre defined colors for account to choose from randomly whenever a new user create an account

const signupPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const data = matchedData(req, { locations: ["body"] });

    const createdUser = await authService.register(data);

    /*  Let the user join to a global chat with ID of 14 */
    await conversationService.joinConversation(createdUser.id, 14);

    const payLoad = {
      user: {
        id: createdUser.id,
        firstname: createdUser.firstname,
        lastname: createdUser.lastname,
        username: createdUser.username,
        email: createdUser.email,
      },
    };

    const token = sign(payLoad);

    return res.json({
      message: "Your account is created successfully.",
      token: token,
      user: payLoad.user,
    });
  } catch (err) {
    next(err);
  }
};

const loginPost = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await authService.verifyCredentials(username, password);

    const payload = {
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user?.profile.email || "",
      },
    };
    const token = sign(payload);
    return res.json({ token: token, user: payload.user });
  } catch (err) {
    next(err);
  }
};

const changePasswordPatch = async (req, res, next) => {
  const currentUser = req.currentUser;
  const newPassword = req.body.newPassword;
  const previousPassword = req.body.previousPassword;
  try {
    const updatedUser = await authService.changePassword(
      currentUser.id,
      previousPassword,
      newPassword,
    );
    return res.json({
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginPost,
  signupPost,
  changePasswordPatch,
};
