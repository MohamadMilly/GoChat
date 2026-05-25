const jwt = require("jsonwebtoken");

// import enviroment variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const prisma = require("../lib/prisma");

const conversationService = require("../services/conversation/conversationService");
const giveParticipantsWithRoles = require("../services/conversation/utils/giveParticipantsWithRoles");
const filterConversationByPermissions = require("../services/conversation/utils/filterConversationByPermissions");
const messageService = require("../services/message/messageService");

const getSpecificConversationGet = async (req, res, next) => {
  const { conversationId: conversationIdString } = req.params;
  const userId = req.currentUser.id;
  const conversationId = Number(conversationIdString);

  try {
    let conversation = await conversationService.getConversation(
      conversationId,
      {
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  username: true,
                  accountColor: true,
                  preferences: true,
                  profile: true,
                  bannedUsers: {
                    where: {
                      bannedUserId: userId,
                    },
                  },
                },
              },
            },
          },
          admins: true,
          permissions: true,
        },
      },
    );
    /* NOTE : These variables are raw without any filtering */
    const participants = conversation.participants;
    const admins = conversation.admins;
    const permissions = conversation.permissions;

    const isCurrentUserParticipant = participants.some(
      (p) => p.userId === userId,
    );

    let currentUserAdminData;
    if (userId) {
      currentUserAdminData = admins.find((admin) => admin.userId === userId);
    }
    const isCurrentUserOwner = currentUserAdminData
      ? currentUserAdminData.isOwner
      : false;

    const membersCount = participants.length;
    conversation = filterConversationByPermissions(
      conversation,
      participants,
      permissions,
      currentUserAdminData,
      isCurrentUserParticipant,
      "DIRECT",
    );

    conversation = {
      ...conversation,
      participants: giveParticipantsWithRoles(
        conversation.participants,
        admins,
      ),
    };

    /* ---- UnReadMessages ----  */
    const unReadMessagesData = await messageService.getUnReadMessages(
      conversationId,
      userId,
    );
    return res.json({
      conversation: conversation,
      membersCount,
      isJoined: isCurrentUserParticipant,
      isAdmin: !!currentUserAdminData,
      isOwner: isCurrentUserOwner,
      ...(conversation.type === "DIRECT" && participants.length > 0
        ? { partnerId: participants.find((p) => p.userId !== userId)?.userId }
        : {}),
      unReadMessagesData: unReadMessagesData,
      type: conversation.type,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/* Note : edit the frontend to append the current user (creator) in the participants */

const createNewConversationPost = async (req, res, next) => {
  const currentUser = req.currentUser;
  const { participants, type, title, avatar, description } = req.body;
  const membersCount = participants.length;
  try {
    const conversation = await conversationService.createConversation(
      participants,
      type,
      title,
      avatar,
      description,
      currentUser.id,
    );
    return res.json({
      conversation,
      membersCount,
    });
  } catch (err) {
    next(err);
  }
};

const queryGroupsGet = async (req, res, next) => {
  const { title } = req.query;
  try {
    const conversations = await conversationService.queryConversations(title);

    return res.json({
      conversations: conversations,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const joinConversationPost = async (req, res, next) => {
  const currentUser = req.currentUser;
  const conversationId = req.params.conversationId;
  try {
    const conversationParticipant = await conversationService.joinConversation(
      currentUser.id,
      Number(conversationId),
    );
    if (conversationParticipant) {
      return res.json({
        message: "You have successfully joined the conversation",
      });
    }
  } catch (err) {
    next(err);
  }
};

/*
No one can remove the owner , so if the owner does not exists in the new participants , reject 
*/

const editGroupPut = async (req, res, next) => {
  const currentUser = req.currentUser;
  const { conversationId: conversationIdString } = req.params;
  const conversationId = Number(conversationIdString);
  const { title, description, participants, avatar } = req.body;
  try {
    /*
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
    const doesOwnerExistAndAdmin = newGroupAdmins.some(
      (admin) => admin.isOwner && admin.isAdmin,
    );
    if (!doesOwnerExistAndAdmin) {
      return res.status(401).json({
        message: "Conversation should not be without an owner.",
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
      include: {
        participants: true,
      },
    }); */
    const updatedGroup = await conversationService.editConversationMetaData(
      conversationId,
      { title, description, participants, avatar },
      currentUser.id,
    );
    return res.json({
      conversation: updatedGroup,
    });
  } catch (err) {
    next(err);
  }
};

const conversationPermissionsGet = async (req, res, next) => {
  const { conversationId } = req.params;
  try {
    const permissions = await conversationService.getConversationPermissions(
      Number(conversationId),
    );
    if (!permissions) {
      return res.status(404).json({
        message: "No Permissions for this group yet.",
      });
    }
    res.json({
      permissions: permissions,
    });
  } catch (err) {
    next(err);
  }
};

const conversationPermissionsPut = async (req, res, next) => {
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
    const updatedPermissions =
      await conversationService.editConversationPermissions(
        Number(conversationId),
        currentUser.id,
        {
          sendingMessages,
          sendingMedia,
          onlineMembers,
          hideUsersForVisitors,
          messageReaders,
          viewMembers,
        },
      );
    return res.json({
      permissions: updatedPermissions,
    });
  } catch (err) {
    next(err);
  }
};

/* 
 TODO : 
 if the conversation is direct => delete it from both partners 
 if the conversation is group => is the user the owner ? => yes delete the group entirely 
 if the user is admin => delete the user admin record and just leave
 if the user is just a member just leave (delete conversationParticipant record)
 */

const leaveOrDeleteConversationDelete = async (req, res, next) => {
  const currentUser = req.currentUser;
  const conversationId = Number(req.params.conversationId);
  try {
    const action = await conversationService.leaveOrDeleteConversation(
      currentUser.id,
      conversationId,
    );
    return res.json({
      message:
        action === "leave"
          ? "Left conversation successfully."
          : "Deleted conversation successfully.",
    });
  } catch (err) {
    next(err);
  }
};

const addParticipantPost = async (req, res, next) => {
  const currentUser = req.currentUser;
  const { conversationId: conversationIdString } = req.params;
  const numericConversationId = Number(conversationIdString);
  const { userId } = req.body;
  try {
    const createdParticipant = await conversationService.addParticipant(
      numericConversationId,
      userId,
    );
    return res.json({
      participant: createdParticipant,
    });
  } catch (err) {
    next(err);
  }
};

const removeParticipantDelete = async (req, res, next) => {
  const currentUser = req.currentUser;
  const {
    conversationId: conversationIdString,
    participantId: participantIdString,
  } = req.params;
  const numericConversationId = Number(conversationIdString);
  const participantId = Number(participantIdString);

  try {
    const currentUserAdminRecord = await prisma.conversationAdmin.findUnique({
      where: {
        conversationId_userId: {
          conversationId: numericConversationId,
          userId: currentUser.id,
        },
      },
    });
    if (!currentUserAdminRecord) {
      res.status(401).json({
        message: "Admins can only update conversation participants.",
      });
    }

    const result = await conversationService.removeParticipant(
      numericConversationId,
      participantId,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};

const addAdminPost = async (req, res, next) => {
  const currentUser = req.currentUser;
  const { conversationId: conversationIdString } = req.params;
  const numericConversationId = Number(conversationIdString);
  const { participantId } = req.body;
  try {
    const createdAdmin = await conversationService.addAdmin(
      numericConversationId,
      Number(participantId),
      currentUser.id,
    );
    return res.json({
      admin: createdAdmin,
    });
  } catch (err) {
    next(err);
  }
};

const removeAdminDelete = async (req, res, next) => {
  const currentUser = req.currentUser;
  const { conversationId: conversationIdString, userId: userIdString } =
    req.params;
  const numericConversationId = Number(conversationIdString);
  const userId = Number(userIdString);
  try {
    const result = await conversationService.removeAdmin(
      numericConversationId,
      userId,
      currentUser.id,
    );
    return res.json(result);
  } catch (err) {
    next(err);
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
  leaveOrDeleteConversationDelete,
  addParticipantPost,
  removeParticipantDelete,
  addAdminPost,
  removeAdminDelete,
};
