const jwt = require("jsonwebtoken");

// import enviroment variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const bcrypt = require("bcryptjs");

const prisma = require("../lib/prisma");
const filterProfile = require("../utils/filterProfile");

const editProfilePut = async (req, res) => {
  const currentUser = req.currentUser;
  const { bio, phoneNumber, birthday, email, avatar, avatarBackground } =
    req.body;

  try {
    const updatedProfile = await prisma.profile.upsert({
      where: {
        userId: parseInt(currentUser.id),
      },
      update: {
        bio,
        phoneNumber,
        birthday,
        email,
        avatar,
        avatarBackground,
      },
      create: {
        bio,
        phoneNumber,
        birthday,
        email,
        avatar,
        avatarBackground,
        user: {
          connect: {
            id: currentUser.id,
          },
        },
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
    isBirthdayHidden,
    preferredVerification,
  } = req.body;

  /* const data = {};
  data.isEmailHidden = isEmailHidden;
  data.isBioHidden = isBioHidden;
  data.isPhoneNumberHidden = isPhoneNumberHidden
    ? isPhoneNumberHidden
    : undefined;
  data.isAvatarHidden = isAvatarHidden ? isAvatarHidden : undefined;
  data.isAvatarBackgroundHidden = isAvatarBackgroundHidden
    ? isAvatarBackgroundHidden
    : undefined;
  data.preferredVerification = preferredVerification
    ? preferredVerification
    : undefined; */

  try {
    const updatedPreferences = await prisma.preferences.upsert({
      where: {
        userId: currentUser.id,
      },
      update: {
        isEmailHidden,
        isBioHidden,
        isPhoneNumberHidden,
        isAvatarHidden,
        isAvatarBackgroundHidden,
        isBirthdayHidden,
        preferredVerification,
      },
      create: {
        isEmailHidden,
        isBioHidden,
        isPhoneNumberHidden,
        isAvatarHidden,
        isAvatarBackgroundHidden,
        isBirthdayHidden,
        preferredVerification,
        user: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });
    return res.json({
      preferences: updatedPreferences,
    });
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
          include: {
            readers: true,
            sender: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
              },
            },
          },
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
        accountColor: true,
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

const getCurrentUserGet = async (req, res) => {
  const currentUser = req.currentUser;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        profile: true,
        accountColor: true,
      },
    });
    if (!user) {
      return res.json({
        message: "This account is not found.",
      });
    }
    const userPreferences = await prisma.preferences.findUnique({
      where: {
        userId: currentUser.id,
      },
    });

    return res.json({
      user: user,
      preferences: userPreferences,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while getting this user data.",
    });
  }
};

const getCurrentuserPreferences = async (req, res) => {
  const currentUser = req.currentUser;
  try {
    const preferences = await prisma.preferences.findUnique({
      where: {
        userId: currentUser.id,
      },
    });
    if (!preferences) {
      return res.status(404).json({
        message: "User or preferences are not defined.",
      });
    }

    return res.json({
      preferences: preferences,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while getting preferences.",
    });
  }
};

const deleteAccountDelete = async (req, res) => {
  const currentUser = req.currentUser;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: "User is not found.",
      });
    }
    const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        password: randomPassword,
        profile: {
          update: {
            avatar: "",
            avatarBackground: "",
            email: "",
            phoneNumber: "",
          },
        },
        accountColor: "#191919",
        firstname: "Deleted",
        lastname: "Account",
        username: `Deleted_${currentUser.id}`,
        deleted: true,
      },
    });
    return res.json({
      message: "The account is deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while deleting the account.",
      error: err.message,
    });
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
};
