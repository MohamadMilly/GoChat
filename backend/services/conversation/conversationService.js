const prisma = require("../../lib/prisma");
const HttpError = require("../../shared/errors/HttpError");
const filterProfile = require("../../shared/utils/filterProfile");
const filterUser = require("../../shared/utils/filterUser");
const permissionsService = require("./permissionService");

async function joinConversation(userId, conversationId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      firstname: true,
      lastname: true,
    },
  });
  if (!user) {
    throw new HttpError("User does not exist.", 404);
  }
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
  });
  if (!conversation) {
    throw new HttpError("Conversation does not exist.", 404);
  }

  const existingParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        userId: userId,
        conversationId: conversationId,
      },
    },
  });
  if (existingParticipant) {
    throw new HttpError("User is already in this conversation.", 400);
  }
  const newConversationParticipant =
    await prisma.conversationParticipant.create({
      data: {
        conversation: {
          connect: {
            id: conversationId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

  return user;
}

async function getConversation(conversationId, options = {}) {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
      ...(options?.where ? options.where : {}),
    },

    ...(options?.include ? { include: options.include } : {}),
  });
  if (!conversation) {
    throw new HttpError("Conversation does not exist", 404);
  }
  return conversation;
}

async function getParticipants(conversationId) {
  const participants = await prisma.conversationParticipant.findMany({
    where: {
      conversationId: conversationId,
    },
  });
  return participants;
}

/* -- helper func to reduce repeated logic */

async function initializeConversation(participants, metaData, creatorId) {
  console.log(participants);
  const initialConversation = await prisma.conversation.create({
    data: {
      ...metaData,
      participants: {
        create: participants.map((p) => ({
          user: { connect: { id: p.id } },
        })),
      },

      admins: {
        create: {
          isOwner: true,
          user: {
            connect: {
              id: creatorId,
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
            select: {
              id: true,
              firstname: true,
              lastname: true,
              username: true,
              accountColor: true,
              profile: true,
              preferences: true,
            },
          },
        },
      },
      permissions: true,
    },
  });

  return initialConversation;
}

async function createConversation(
  participants,
  type,
  title,
  avatar,
  description,
  creatorId,
) {
  let conversation;
  switch (type) {
    case "DIRECT":
      const participantsIds = participants.map((p) => p.id);
      const existingDirect = await prisma.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  userId: {
                    in: participantsIds,
                  },
                },
              },
            },
            {
              participants: {
                every: {
                  userId: {
                    in: participantsIds,
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
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  username: true,
                  accountColor: true,
                  profile: true,
                  preferences: true,
                },
              },
            },
          },
          permissions: true,
        },
      });

      if (existingDirect) {
        conversation = existingDirect;
      } else {
        conversation = await initializeConversation(
          participants,
          { type },
          creatorId,
        );
      }
      break;
    case "GROUP":
      conversation = await initializeConversation(
        participants,
        {
          type,
          title,
          description,
          avatar,
        },
        creatorId,
      );
      break;
    default:
      throw new HttpError("Unknown conversation type", 400);
  }

  const filteredConversation = {
    ...conversation,
    participants: conversation.participants.map((p) => ({
      ...p,
      user: filterUser(
        p.user,
        p.user.preferences,
        conversation.permissions || {},
        true,
      ),
    })),
  };
  return filteredConversation;
}

async function queryConversations(query) {
  if (!query) {
    throw new HttpError("Query is required.", 400);
  }
  const conversations = await prisma.conversation.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              title: {
                contains: query,
              },
            },
            {
              description: {
                contains: query,
              },
            },
          ],
        },
        { type: "GROUP" },
      ],
    },
  });

  return conversations;
}

async function editConversationMetaData(conversationId, data, editorId) {
  const existingConversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
  });
  if (!existingConversation) {
    throw new HttpError("Conversation does not exist", 404);
  }
  if (!existingConversation.type === "DIRECT") {
    throw new HttpError(
      "Direct conversations cannot be edited currently.",
      400,
    );
  }
  const editorAdminRecord = await prisma.conversationAdmin.findUnique({
    where: {
      conversationId_userId: {
        conversationId: conversationId,
        userId: editorId,
      },
    },
  });
  if (!editorAdminRecord) {
    throw new Error("Only admins can edit this conversation", 403);
  }
  const updatedConversation = await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      title: data.title,
      description: data.description,
      avatar: data.avatar,
    },
  });
  return updatedConversation;
}

async function validateAdminstration(conversationId, userId) {
  const existingAdminRecord = await prisma.conversationAdmin.findUnique({
    where: {
      conversationId_userId: {
        conversationId: conversationId,
        userId: userId,
      },
    },
  });
  return {
    isOwner: existingAdminRecord ? existingAdminRecord.isOwner : false,
    isAdmin: !!existingAdminRecord,
  };
}

async function validateMembership(conversationId, userId) {
  const existingParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: conversationId,
        userId: userId,
      },
    },
  });

  return !!existingParticipant;
}

async function leaveConversation(userId, conversationId) {
  const deleteAdminPromise = prisma.conversationAdmin.deleteMany({
    where: {
      conversationId: conversationId,
      userId: userId,
    },
  });
  const deleteParticipantPromise = prisma.conversationParticipant.deleteMany({
    where: {
      conversationId: conversationId,
      userId: userId,
    },
  });
  await prisma.$transaction([deleteAdminPromise, deleteParticipantPromise]);
}

async function deleteConversation(conversationId) {
  const deleteMessagesReadersPromise = prisma.messageOnReader.deleteMany({
    where: {
      message: {
        conversationId: conversationId,
      },
    },
  });
  const deleteMessagesReactionsPromise = prisma.reaction.deleteMany({
    where: {
      conversationId: conversationId,
    },
  });
  const deleteMessagesPromise = prisma.message.deleteMany({
    where: {
      conversationId: conversationId,
    },
  });
  const deletePartnersPromise = prisma.conversationParticipant.deleteMany({
    where: {
      conversationId: conversationId,
    },
  });
  const deleteAdminsPromise = prisma.conversationAdmin.deleteMany({
    where: {
      conversationId: conversationId,
    },
  });
  const deletePermissionsPromise = prisma.permissions.delete({
    where: {
      conversationId: conversationId,
    },
  });
  const deleteConversationPromise = prisma.conversation.delete({
    where: {
      id: conversationId,
    },
  });
  /* Delete all previous in order by transaction */
  await prisma.$transaction([
    deleteMessagesReadersPromise,
    deleteMessagesReactionsPromise,
    deleteMessagesPromise,
    deletePartnersPromise,
    deleteAdminsPromise,
    deletePermissionsPromise,
    deleteConversationPromise,
  ]);
}

async function leaveOrDeleteConversation(userId, conversationId) {
  const conversation = await getConversation(conversationId);
  if (!conversation) {
    throw new HttpError("Conversation does not exist", 404);
  }
  const isMember = await validateMembership(conversationId, userId);
  if (!isMember) {
    throw new HttpError("You are not a part in this conversation.", 400);
  }
  const { isOwner, isAdmin } = await validateAdminstration(
    conversationId,
    userId,
  );

  if (isOwner || conversation.type === "DIRECT") {
    await deleteConversation(conversationId);
    return "delete";
  } else {
    await leaveConversation(userId, conversationId);
    return "leave";
  }
}

async function addParticipant(conversationId, userId) {
  const existingConversationParticipant =
    await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
    });
  if (existingConversationParticipant) {
    throw new HttpError("This user is already a participant.", 400);
  }
  const createdParticipant = await prisma.conversationParticipant.create({
    data: {
      conversation: {
        connect: {
          id: conversationId,
        },
      },
    },
  });
  return createdParticipant;
}

async function removeParticipant(conversationId, participantId) {
  const existingConversationParticipant =
    await prisma.conversationParticipant.findUnique({
      where: {
        id: participantId,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
  if (!existingConversationParticipant) {
    throw new HttpError("This user is already not a participant.", 400);
  }

  const adminRecord = await prisma.conversationAdmin.findUnique({
    where: {
      conversationId_userId: {
        conversationId: conversationId,
        userId: existingConversationParticipant.userId,
      },
    },
  });
  if (adminRecord && adminRecord?.isOwner) {
    throw new HttpError("The Owner cannot be removed.");
  }
  const deleteReactionsPromise = prisma.reaction.deleteMany({
    where: {
      conversationId: conversationId,
      reactorId: existingConversationParticipant.userId,
    },
  });
  const deleteAdminPromise = prisma.conversationAdmin.deleteMany({
    where: {
      conversationId: conversationId,
      userId: existingConversationParticipant.userId,
    },
  });
  const deleletParticipantPromise = prisma.conversationParticipant.delete({
    where: {
      id: participantId,
    },
  });
  await prisma.$transaction([
    deleteReactionsPromise,
    deleteAdminPromise,
    deleletParticipantPromise,
  ]);

  return { message: "Participant is removed successfully." };
}

async function addAdmin(conversationId, participantId, assignedById) {
  const existingConversationParticipant =
    await prisma.conversationParticipant.findUnique({
      where: {
        id: participantId,
      },
    });
  if (!existingConversationParticipant) {
    throw new HttpError("This user is not a part in the conversation", 404);
  }
  const assignedByAdminExistingRecord =
    await prisma.conversationAdmin.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: assignedById,
        },
      },
    });
  if (
    !assignedByAdminExistingRecord ||
    !assignedByAdminExistingRecord?.isOwner
  ) {
    throw new HttpError("Only the owner can add new admins", 401);
  }
  const newAdmin = await prisma.conversationAdmin.create({
    data: {
      conversation: {
        connect: {
          id: conversationId,
        },
      },
      user: {
        connect: {
          id: existingConversationParticipant.userId,
        },
      },
      assignedBy: {
        connect: {
          conversationId_userId: {
            conversationId: conversationId,
            userId: assignedById,
          },
        },
      },
    },
  });
  return newAdmin;
}

async function removeAdmin(conversationId, userId, currentUserId) {
  const existsingAdminRecord = await prisma.conversationAdmin.findUnique({
    where: {
      conversationId_userId: {
        conversationId: conversationId,
        userId: userId,
      },
    },
  });
  if (!existsingAdminRecord) {
    throw new HttpError("This user is already not an admin.", 400);
  }
  const curretUserAdminRecord = await prisma.conversationAdmin.findUnique({
    where: {
      conversationId_userId: {
        conversationId: conversationId,
        userId: currentUserId,
      },
    },
  });
  if (!curretUserAdminRecord || !curretUserAdminRecord?.isOwner) {
    throw new HttpError("Only the owner can remove admins", 401);
  }

  await prisma.conversationAdmin.delete({
    where: {
      conversationId_userId: {
        conversationId: conversationId,
        userId: userId,
      },
    },
  });
  return { message: "Removed admin successfullly." };
}

module.exports = {
  joinConversation,
  getConversation,
  getParticipants,
  createConversation,
  queryConversations,
  editConversationMetaData,
  leaveOrDeleteConversation,
  addParticipant,
  removeParticipant,
  addAdmin,
  removeAdmin,
  ...permissionsService,
};
