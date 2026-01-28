const jwt = require("jsonwebtoken");

// import enviroment variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const bcrypt = require("bcryptjs");

const prisma = require("../lib/prisma");
const filterProfile = require("../utils/filterProfile");

const editProfilePatch = async (req, res) => {
  const currentUser = req.currentUser;
  const { bio, phoneNumber, birthday, email, avatar, avatarBackground } =
    req.body;
  const data = {};
  data.bio = bio ? bio : undefined;
  data.phoneNumber = phoneNumber ? phoneNumber : undefined;
  data.birthday = birthday ? birthday : undefined;
  data.email = email ? email : undefined;
  data.avatar = avatar ? avatar : undefined;
  data.avatarBackground = avatarBackground ? avatarBackground : undefined;
  try {
    const updatedProfile = await prisma.profile.upsert({
      where: {
        userId: parseInt(currentUser.id),
      },
      data: {
        ...data,
      },
      create: {
        ...data,
      },
    });
    return res.json({
      profile: updatedProfile,
    });
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
    preferredVerification,
  } = req.body;
  const data = {};
  data.isEmailHidden = isEmailHidden ? isEmailHidden : undefined;
  data.isBioHidden = isBioHidden ? isBioHidden : undefined;
  data.isPhoneNumberHidden = isPhoneNumberHidden
    ? isPhoneNumberHidden
    : undefined;
  data.isAvatarHidden = isAvatarHidden ? isAvatarHidden : undefined;
  data.isAvatarBackgroundHidden = isAvatarBackgroundHidden
    ? isAvatarBackgroundHidden
    : undefined;
  data.preferredVerification = preferredVerification
    ? preferredVerification
    : undefined;
  try {
    const updatedPreferences = await prisma.preferences.upsert({
      where: {
        userId: parseInt(currentUser.id),
      },
      data: {
        ...data,
      },
      create: {
        ...data,
      },
    });
    return res.json({
      preferences: updatedPreferences,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unxpected error happened while updating preferences",
    });
  }
};
const myConversationsGet = async (req, res) => {
  const currentUser = req.currentUser;
  try {
    let conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: currentUser.id },
        },
      },
      include: {
        participants: {
          include: { user: { include: { profile: true } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const participantIds = conversations.flatMap((c) =>
      c.participants.map((p) => p.userId),
    );
    const preferences = await prisma.preferences.findMany({
      where: { userId: { in: participantIds } },
    });

    conversations = conversations.map((conversation) => ({
      ...conversation,
      participants: conversation.participants.map((participant) => ({
        ...participant,
        user: filterProfile(participant.user, preferences),
      })),
    }));

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
    let users = await prisma.user.findMany({
      where: {
        NOT: { id: currentUser.id },
        OR: [
          { username: { contains: query } },
          { firstname: { in: queryArr } },
          { lastname: { in: queryArr } },
        ],
      },
      include: { profile: true },
    });

    const preferences = await prisma.preferences.findMany({
      where: { userId: { in: users.map((u) => u.id) } },
    });

    users = users.map((user) => filterProfile(user, preferences));

    return res.json({ users });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while fetching users.",
      error: err,
    });
  }
};
const getMyContactsGet = async (req, res) => {
  const currentUser = req.currentUser;
  try {
    const myConversations = await prisma.conversationParticipant.findMany({
      where: { userId: currentUser.id },
      select: { conversationId: true },
    });

    let users = await prisma.user.findMany({
      where: {
        conversations: {
          some: {
            conversationId: {
              in: myConversations.map((c) => c.conversationId),
            },
          },
        },
        NOT: { id: currentUser.id },
      },
      include: { profile: true },
    });

    const preferences = await prisma.preferences.findMany({
      where: { userId: { in: users.map((u) => u.id) } },
    });

    users = users.map((user) => filterProfile(user, preferences));

    return res.json({ users });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while getting contacts.",
      error: err,
    });
  }
};

const getSpecificUserGet = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        profile: true,
      },
    });
    const userPreferences = await prisma.preferences.findUnique({
      where: {
        userId: parseInt(userId),
      },
    });

    const filteredUser = filterProfile(user, [userPreferences]);
    return res.json({
      user: filteredUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Unexpected error happened  while getting this user profile.",
    });
  }
};

module.exports = {
  myConversationsGet,
  queryUsersGet,
  getMyContactsGet,
  getSpecificUserGet,
};
