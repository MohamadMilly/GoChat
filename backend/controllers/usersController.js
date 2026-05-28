const jwt = require("jsonwebtoken");

// import enviroment variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const bcrypt = require("bcryptjs");

const prisma = require("../lib/prisma");
const userService = require("../services/user/userService");

const editProfilePut = async (req, res) => {
  const currentUser = req.currentUser;
  const { bio, phoneNumber, birthday, email, avatar, avatarBackground } =
    req.body;

  try {
    const updatedProfile = await userService.editProfile(currentUser.id, {
      bio,
      phoneNumber,
      birthday,
      email,
      avatar,
      avatarBackground,
    });
    return res.json({ profile: updatedProfile });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while updating profile.",
    });
  }
};

const preferencesPatch = async (req, res) => {
  const currentUser = req.currentUser;
  const {
    isEmailHidden,
    isBioHidden,
    isPhoneNumberHidden,
    isAvatarHidden,
    isAvatarBackgroundHidden,
    isBirthdayHidden,
    preferredVerification,
  } = req.body;

  try {
    const updatedPreferences = await userService.updatePreferences(
      currentUser.id,
      {
        isEmailHidden,
        isBioHidden,
        isPhoneNumberHidden,
        isAvatarHidden,
        isAvatarBackgroundHidden,
        isBirthdayHidden,
        preferredVerification,
      },
    );
    return res.json({ preferences: updatedPreferences });
  } catch (err) {
    return res.status(500).json({
      message: "Unxpected error happened while updating preferences",
      error: err.message,
    });
  }
};

const myConversationsGet = async (req, res) => {
  const currentUser = req.currentUser;

  try {
    const conversations = await userService.getMyConversations(currentUser.id);
    return res.json({ conversations });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Unexpected error happened while getting chats.",
    });
  }
};
const queryUsersGet = async (req, res) => {
  const { query } = req.query;
  const currentUser = req.currentUser;
  const queryArr = query.split(" ");
  try {
    const users = await userService.queryUsers(query, currentUser.id);
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while fetching users.",
      error: err.stack,
    });
  }
};
const getMyContactsGet = async (req, res) => {
  const currentUser = req.currentUser;
  try {
    const users = await userService.getMyContacts(currentUser.id);
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Unexpected error happened while getting contacts.",
      error: err,
    });
  }
};

/*
TO DO : (Done)
Exculde all the profiles where their userIds are not in the current user banning list
*/

const getSpecificUserGet = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.currentUser;

  try {
    const result = await userService.getSpecificUser(userId, currentUser.id);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Unexpected error happened  while getting this user profile.",
    });
  }
};

const getCurrentUserGet = async (req, res) => {
  const currentUser = req.currentUser;

  try {
    const result = await userService.getCurrentUser(currentUser.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while getting this user data.",
      error: err.stack,
    });
  }
};

const getCurrentuserPreferences = async (req, res) => {
  const currentUser = req.currentUser;
  try {
    const preferences = await userService.getCurrentUserPreferences(
      currentUser.id,
    );
    return res.json({ preferences });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while getting preferences.",
    });
  }
};

const deleteAccountDelete = async (req, res) => {
  const currentUser = req.currentUser;
  try {
    const result = await userService.deleteAccount(currentUser.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while deleting the account.",
      error: err.message,
    });
  }
};

const editUserPatch = async (req, res, next) => {
  const currentUser = req.currentUser;
  const {
    firstname,
    username,
    lastname,
    password,
    passwordConfirmation,
    accountColor,
    blockedUserId,
    stickers,
    addStickers,
    removeStickers,
  } = req.body;

  try {
    const result = await userService.editUser(currentUser.id, {
      firstname,
      username,
      lastname,
      password,
      passwordConfirmation,
      accountColor,
      blockedUserId,
      addStickers,
      removeStickers,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  myConversationsGet,
  queryUsersGet,
  getMyContactsGet,
  getSpecificUserGet,
  getCurrentUserGet,
  getCurrentuserPreferences,
  preferencesPatch,
  editProfilePut,
  deleteAccountDelete,
  editUserPatch,
};
