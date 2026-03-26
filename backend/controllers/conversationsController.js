const jwt = require("jsonwebtoken");

// import enviroment variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const prisma = require("../lib/prisma");
const filterProfile = require("../utils/filterProfile");
const hideUser = require("../utils/hideUser");
const getSpecificConversationGet = async (req, res) => {
  const { conversationId } = req.params;
  const { userId: userIdString } = req.query;
  const userId = parseInt(userIdString);
  try {
    const participantsIds = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      select: {
        userId: true,
      },
    });
    const blockedUsers = await prisma.ban.findMany({
      where: {
        banningUserId: parseInt(userId),
      },
    });
    const blockingnUsers = await prisma.ban.findMany({
      where: {
        bannedUserId: parseInt(userId),
      },
    });
    const isCurrentUserParticipant = userId
      ? participantsIds.some((idData) => idData.userId === userId)
      : false;
    const participantsPreferences = await prisma.preferences.findMany({
      where: {
        userId: {
          in: participantsIds.map((p) => p.userId),
        },
      },
    });
    const permissions = await prisma.permissions.findUnique({
      where: {
        conversationId: parseInt(conversationId),
      },
    });
    let currentUserAdminData;
    if (userId) {
      currentUserAdminData = await prisma.conversationAdmin.findUnique({
        where: {
          conversationId_userId: {
            conversationId: parseInt(conversationId),
            userId: userId,
          },
        },
      });
    }

    let conversation = await prisma.conversation.findUnique({
      where: {
        id: parseInt(conversationId),
      },
      include: {
        participants:
          permissions?.viewMembers || !!currentUserAdminData
            ? {
                include: {
                  user: {
                    select: {
                      id: true,
                      profile: {
                        where: {
                          NOT: {
                            userId: {
                              in: (
                                await prisma.$queryRawUnsafe(
                                  `SELECT "banningUserId" FROM "Ban" WHERE "bannedUserId" = ${userId}`,
                                )
                              ).map(
                                (banningUserObj) =>
                                  banningUserObj.banningUserId,
                              ),
                            },
                          },
                        },
                      },
                      firstname: true,
                      lastname: true,
                      username: true,
                      accountColor: true,
                    },
                  },
                },
              }
            : false,
        admins: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation is not found.",
      });
    }
    const isCurrentUserAdmin = conversation.admins.some(
      (admin) => admin.userId === userId,
    );
    const membersCount = await prisma.conversationParticipant.count({
      where: {
        conversationId: parseInt(conversationId),
      },
    });
    if (permissions?.viewMembers || !!currentUserAdminData) {
      conversation = {
        ...conversation,
        participants: conversation.participants.map((participant) => ({
          ...participant,
          isAdmin: conversation.admins.some(
            (admin) => admin.userId === participant.userId,
          ),
          isOwner: conversation.admins.some(
            (admin) => admin.userId === participant.userId && admin.isOwner,
          ),
          user:
            permissions?.hideUsersForVisitors && !isCurrentUserParticipant
              ? hideUser(participant.user)
              : filterProfile(participant.user, participantsPreferences),
        })),
      };
    } else {
      conversation = {
        ...conversation,
        participants: [],
      };
    }
    return res.json({
      conversation: conversation,
      membersCount,
      isJoined: isCurrentUserParticipant,
      isAdmin: isCurrentUserAdmin,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      message: "Unexpected error happened while getting the conversation",
    });
  }
};

const createNewConversationPost = async (req, res) => {
  const currentUser = req.currentUser;
  const { participants, type, title, avatar, description } = req.body;
  const participantsWithMe = [currentUser, ...participants];
  const membersCount = participantsWithMe.length;
  const isOnetoOneChat = membersCount === 2 && type === "DIRECT";

  if (isOnetoOneChat) {
    const [userAId, userBId] = participantsWithMe.map((p) => p.id);

    const oneToOneChat = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: userAId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: userBId,
              },
            },
          },
          {
            participants: {
              every: {
                userId: {
                  in: [userAId, userBId],
                },
              },
            },
          },
        ],
        type: "DIRECT",
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: true,
      },
    });
    if (oneToOneChat) {
      const participantsPreferences = await prisma.preferences.findMany({
        where: {
          userId: {
            in: oneToOneChat.participants.map((p) => p.userId),
          },
        },
      });
      const filteredParticipants = oneToOneChat.participants.map(
        (participant) => ({
          ...participant,
          user: filterProfile(participant.user, participantsPreferences),
        }),
      );

      return res.json({
        conversation: {
          ...oneToOneChat,
          participants: filteredParticipants,
        },
      });
    }
  }
  try {
    let createdConversation = await prisma.conversation.create({
      data: {
        avatar: avatar || undefined,
        title: title || undefined,
        description: description || undefined,
        type: type,
        participants: {
          create: participantsWithMe.map((p) => ({
            user: {
              connect: {
                id: p.id,
              },
            },
          })),
        },
        admins: {
          create: {
            isOwner: true,
            user: {
              connect: {
                id: currentUser.id,
              },
            },
          },
        },
        permissions: {
          create: {},
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: true,
      },
    });
    const participantsPreferences = await prisma.preferences.findMany({
      where: {
        userId: {
          in: createdConversation.participants.map((p) => p.userId),
        },
      },
    });

    const filteredParticipants = createdConversation.participants.map(
      (participant) => ({
        ...participant,
        user: filterProfile(participant.user, participantsPreferences),
      }),
    );

    return res.json({
      conversation: {
        ...createdConversation,
        participants: filteredParticipants,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while creating the conversation.",
    });
  }
};

const queryGroupsGet = async (req, res) => {
  const { title } = req.query;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        AND: [
          {
            title: {
              contains: title,
            },
          },
          { type: "GROUP" },
        ],
      },
    });
    return res.json({
      conversations: conversations,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while getting the conversations",
    });
  }
};

const joinConversationPost = async (req, res) => {
  const currentUser = req.currentUser;
  const conversationId = req.params.conversationId;
  try {
    const conversationParticipant = await prisma.conversationParticipant.create(
      {
        data: {
          user: {
            connect: {
              id: currentUser.id,
            },
          },
          conversation: {
            connect: {
              id: parseInt(conversationId),
            },
          },
        },
      },
    );
    if (conversationParticipant) {
      return res.json({
        message: "You have successfully joined the conversation",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while joining this conversation.",
    });
  }
};

const editGroupPut = async (req, res) => {
  const currentUser = req.currentUser;
  const { conversationId } = req.params;
  const { title, description, participants, avatar } = req.body;
  try {
    const groupAdmins = await prisma.conversationAdmin.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
    });
    const newGroupAdmins = participants.filter((p) => p.isAdmin);
    const groupParticipantsIds = participants.map((p) => p.userId);
    const currentUserAdminObj = groupAdmins.find(
      (admin) => admin.userId === currentUser.id,
    );
    if (!currentUserAdminObj) {
      return res.status(401).json({
        message: "editing the group is only permissible by admins ",
      });
    }
    const updatedGroup = await prisma.conversation.update({
      where: {
        id: parseInt(conversationId),
      },
      data: {
        title,
        avatar,
        description,
        participants: {
          deleteMany: {
            NOT: {
              userId: {
                in: groupParticipantsIds,
              },
            },
          },
          upsert: participants.map((p) => ({
            where: {
              conversationId_userId: {
                conversationId: parseInt(conversationId),
                userId: p.userId,
              },
            },
            update: {},
            create: { user: { connect: { id: p.userId } } },
          })),
        },
        admins: {
          deleteMany: {
            NOT: {
              userId: {
                in: newGroupAdmins.map((p) => p.userId),
              },
            },
          },
          upsert: newGroupAdmins.map((p) => {
            return {
              where: {
                conversationId_userId: {
                  userId: p.userId,
                  conversationId: parseInt(conversationId),
                },
              },
              create: {
                user: { connect: { id: p.userId } },
                assignedBy: {
                  connect: {
                    id: currentUserAdminObj.id,
                  },
                },
              },
              update: {
                isOwner: p.isOwner,
                assignedBy: {
                  connect: {
                    id: currentUserAdminObj.id,
                  },
                },
              },
            };
          }),
        },
      },
    });
    return res.json({
      conversation: updatedGroup,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while editing the group",
      error: err.message,
    });
  }
};

const conversationPermissionsGet = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const group = await prisma.conversation.findUnique({
      where: {
        id: parseInt(conversationId),
      },
      include: {
        admins: true,
      },
    });
    if (!group) {
      return res.status(404).json({
        message: "There is no conversation has this id.",
      });
    }
    const groupPermissions = await prisma.permissions.findUnique({
      where: {
        conversationId: parseInt(conversationId),
      },
    });
    if (groupPermissions) {
      return res.json({
        permissions: groupPermissions,
        admins: group.admins,
      });
    }
    return res.status(404).json({
      message: "No Permissions for this group yet.",
    });
  } catch (err) {
    return res.status(500).json({
      message:
        "Unexpected error happened while getting this conversation permissions.",
      error: err.message,
    });
  }
};

const conversationPermissionsPut = async (req, res) => {
  const currentUser = req.currentUser;
  const { conversationId } = req.params;
  const {
    sendingMessages,
    sendingMedia,
    onlineMembers,
    hideUsersForVisitors,
    messageReaders,
    viewMembers,
  } = req.body;
  try {
    const group = await prisma.conversation.findUnique({
      where: {
        id: parseInt(conversationId),
      },
      include: {
        admins: true,
      },
    });
    if (!group) {
      return res.status(404).json({
        message: "Conversation is not found.",
      });
    }
    const isTheCurrentUserAnAdmin = group.admins.some(
      (admin) => admin.userId === currentUser.id,
    );
    if (!isTheCurrentUserAnAdmin) {
      return res.status(401).json({
        message: "Admins are only allowed to change permissions.",
      });
    }
    const updatedPermissions = await prisma.permissions.update({
      where: {
        conversationId: parseInt(conversationId),
      },
      data: {
        sendingMessages,
        sendingMedia,
        onlineMembers,
        hideUsersForVisitors,
        messageReaders,
        viewMembers,
      },
    });
    return res.json({
      permissions: updatedPermissions,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while updating this conversation.",
    });
  }
};

module.exports = {
  createNewConversationPost,
  getSpecificConversationGet,
  queryGroupsGet,
  joinConversationPost,
  editGroupPut,
  conversationPermissionsGet,
  conversationPermissionsPut,
};
