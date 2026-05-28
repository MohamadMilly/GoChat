const prisma = require("../../lib/prisma");
const HttpError = require("../../shared/errors/HttpError");
const filterProfile = require("../../shared/utils/filterProfile");
const filterUser = require("../../shared/utils/filterUser");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function editProfile(userId, profileData) {
  const { bio, phoneNumber, birthday, email, avatar, avatarBackground } =
    profileData;
  const updatedProfile = await prisma.profile.upsert({
    where: { userId: Number(userId) },
    update: { bio, phoneNumber, birthday, email, avatar, avatarBackground },
    create: {
      bio,
      phoneNumber,
      birthday,
      email,
      avatar,
      avatarBackground,
      user: { connect: { id: Number(userId) } },
    },
  });
  return updatedProfile;
}

async function updatePreferences(userId, prefs) {
  const {
    isEmailHidden,
    isBioHidden,
    isPhoneNumberHidden,
    isAvatarHidden,
    isAvatarBackgroundHidden,
    isBirthdayHidden,
    preferredVerification,
  } = prefs;

  const updatedPreferences = await prisma.preferences.upsert({
    where: { userId: Number(userId) },
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
      user: { connect: { id: Number(userId) } },
    },
  });
  return updatedPreferences;
}

async function getMyConversations(userId) {
  let conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: Number(userId) } } },
    include: {
      participants: {
        include: {
          user: {
            include: {
              profile: true,
              bannedUsers: {
                where: { bannedUserId: Number(userId) },
              },
              preferences: true,
            },
          },
        },
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
      _count: {
        select: {
          messages: {
            where: { readers: { none: { readerId: Number(userId) } } },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  conversations = conversations.map((conversation) => ({
    ...conversation,
    participants: conversation.participants.map((participant) => ({
      ...participant,
      user: filterUser(participant.user, null, {}, true),
    })),
    unReadMessagesCount: conversation._count.messages,
    lastMessage:
      conversation.messages.length > 0 ? conversation.messages[0] : null,
  }));

  return conversations;
}

async function queryUsers(query, currentUserId) {
  const queryArr = query.split(" ");
  let users = await prisma.$transaction(async (tx) => {
    return await tx.user.findMany({
      where: {
        NOT: { id: Number(currentUserId) },
        OR: [
          { username: { contains: query } },
          { firstname: { in: queryArr } },
          { lastname: { in: queryArr } },
        ],
      },
      include: {
        profile: true,
        bannedUsers: { where: { bannedUserId: Number(currentUserId) } },
        preferences: true,
      },
    });
  });

  const preferences = await prisma.preferences.findMany({
    where: { userId: { in: users.map((u) => u.id) } },
  });
  users = users.map((user) => {
    const pref = preferences.find((p) => p.userId === user.id) || {};
    return { ...user, profile: filterProfile(user.profile, pref) };
  });
  return users;
}

async function getMyContacts(currentUserId) {
  const myConversations = await prisma.conversationParticipant.findMany({
    where: { userId: Number(currentUserId) },
    select: { conversationId: true },
  });

  let users = await prisma.user.findMany({
    where: {
      conversations: {
        some: {
          conversationId: { in: myConversations.map((c) => c.conversationId) },
        },
      },
      NOT: { id: Number(currentUserId) },
      deleted: false,
    },
    include: {
      profile: true,
      bannedUsers: { where: { bannedUserId: Number(currentUserId) } },
      preferences: true,
    },
  });

  const preferences = await prisma.preferences.findMany({
    where: { userId: { in: users.map((u) => u.id) } },
  });
  users = users.map((user) => {
    const pref = preferences.find((p) => p.userId === user.id) || {};
    return { ...user, profile: filterProfile(user.profile, pref) };
  });
  return users;
}

async function getSpecificUser(userId, currentUserId) {
  const user = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SELECT set_config('app.current_user_id', $1, true);`,
      String(currentUserId),
    );

    return await tx.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        profile: true,
        preferences: true,
        bannedUsers: { where: { bannedUserId: Number(currentUserId) } },
        accountColor: true,
      },
    });
  });

  const userPreferences = await prisma.preferences.findUnique({
    where: { userId: Number(userId) },
  });
  const userBannedList = await prisma.ban.findMany({
    where: { banningUserId: Number(userId) },
  });
  const isBlockingCurrentUser = userBannedList.some(
    (userBannedObj) => userBannedObj.bannedUserId === Number(currentUserId),
  );
  const filteredUser = {
    ...user,
    profile: filterProfile(user.profile, userPreferences || {}),
  };
  return { user: filteredUser, isBlocking: isBlockingCurrentUser };
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      username: true,
      profile: true,
      accountColor: true,
      bannedUsers: { select: { bannedUserId: true } },
      banningUsers: true,
      stickers: true,
      preferences: true,
    },
  });
  if (!user) throw new HttpError("This account is not found.", 404);

  return { user, preferences: user.preferences };
}

async function getCurrentUserPreferences(userId) {
  const preferences = await prisma.preferences.findUnique({
    where: { userId: Number(userId) },
  });
  if (!preferences)
    throw new HttpError("User or preferences are not defined.", 404);
  return preferences;
}

async function deleteAccount(userId) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) throw new HttpError("User is not found.", 404);
  const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
  await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      password: randomPassword,
      profile: { update: { avatar: "", avatarBackground: "" } },
      accountColor: "#191919",
      firstname: "Deleted",
      lastname: "Account",
      username: `Deleted_${userId}`,
      deleted: true,
    },
  });
  return { message: "The account is deleted successfully." };
}

async function editUser(userId, payload) {
  const {
    firstname,
    username,
    lastname,
    password,
    passwordConfirmation,
    accountColor,
    blockedUserId,
    addStickers: addStickersStrings,
    removeStickers: removeStickersStrings,
  } = payload;

  const data = {};
  if (firstname) data.firstname = firstname;
  if (lastname) data.lastname = lastname;
  if (accountColor) data.accountColor = accountColor;

  if (blockedUserId) {
    const blockedUserRecord = await prisma.ban.findUnique({
      where: {
        bannedUserId_banningUserId: {
          bannedUserId: Number(blockedUserId),
          banningUserId: Number(userId),
        },
      },
    });
    if (blockedUserRecord) {
      await prisma.ban.delete({
        where: {
          bannedUserId_banningUserId: {
            bannedUserId: Number(blockedUserId),
            banningUserId: Number(userId),
          },
        },
      });
    } else {
      data.bannedUsers = {
        create: { banned: { connect: { id: Number(blockedUserId) } } },
      };
    }
  }

  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) throw new HttpError("User is not found.", 404);

  if (password) {
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new HttpError("Password is incorrect.", 401);
    if (password !== passwordConfirmation)
      throw new HttpError("Passwords do not match.", 401);
    data.password = await bcrypt.hash(password, 10);
  }

  if (username) {
    const userWithThisUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (userWithThisUsername)
      throw new HttpError("This username is already used.", 401);
    data.username = username;
  }
  if (addStickersStrings && addStickersStrings.length > 0) {
    await addStickers(userId, addStickersStrings);
  }
  if (removeStickersStrings && removeStickers.length > 0) {
    await removeStickers(userId, removeStickersStrings);
  }
  const updatedUser = await prisma.user.update({
    where: { id: Number(userId) },
    data,
    select: {
      id: true,
      firstname: true,
      lastname: true,
      username: true,
      accountColor: true,
    },
  });
  return { message: "User is updated successfully.", user: updatedUser };
}

async function addStickers(currentUserId, stickersURLsStrings) {
  const stickerURLs = stickersURLsStrings.map(
    (urlString) => new URL(urlString),
  );
  const user = await prisma.user.findUnique({
    where: {
      id: currentUserId,
    },
    select: {
      stickers: true,
    },
  });
  const previousStickers = user.stickers;
  await prisma.user.update({
    where: {
      id: currentUserId,
    },
    data: {
      stickers: [
        ...previousStickers,
        ...stickerURLs.map((url) => url.toString()),
      ],
    },
  });
  return { message: "Stickers are added successfully." };
}

async function removeStickers(currentUserId, stickersURLsStrings) {
  const stickerURLs = stickersURLsStrings.map(
    (urlString) => new URL(urlString),
  );
  const user = await prisma.user.findUnique({
    where: {
      id: currentUserId,
    },
    select: {
      stickers: true,
    },
  });
  const stringsURL = stickerURLs.map((url) => url.toString());
  user.stickers = user.stickers.filter((url) => !stringsURL?.includes(url));
  await prisma.user.update({
    where: {
      id: currentUserId,
    },
    data: {
      stickers: user.stickers,
    },
  });
  return {
    message: "Stickers are removed successfully.",
  };
}

module.exports = {
  editProfile,
  updatePreferences,
  getMyConversations,
  queryUsers,
  getMyContacts,
  getSpecificUser,
  getCurrentUser,
  getCurrentUserPreferences,
  deleteAccount,
  editUser,
  addStickers,
  removeStickers,
};
