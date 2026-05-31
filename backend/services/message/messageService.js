const prisma = require("../../lib/prisma");
const HttpError = require("../../shared/errors/HttpError");
const conversationService = require("../conversation/conversationService");
const filterMessagesByPermissions = require("./utils/filterMessagesByPermissions");
const filterProfile = require("../../shared/utils/filterProfile");
const filterUser = require("../../shared/utils/filterUser");

const getUnReadMessages = async (conversationId, userId) => {
  const messageOnReader = await prisma.messageOnReader.findFirst({
    where: {
      readerId: userId,
      message: {
        conversationId: Number(conversationId),
      },
    },
    orderBy: {
      seenAt: "desc",
    },
    include: {
      message: true,
    },
  });

  const unReadMessages = await prisma.message.findMany({
    where: {
      ...(messageOnReader && {
        createdAt: {
          gt: messageOnReader.seenAt,
        },
      }),
      conversationId: Number(conversationId),
    },
  });
  return { count: unReadMessages.length, messages: unReadMessages };
};

async function createMessage(messageData, senderId, conversationId) {
  if (!senderId || !conversationId) {
    throw new HttpError("SenderId and conversationId are required.", 400);
  }

  const mediaData = {};
  if (messageData.type !== "TEXT") {
    mediaData.mimeType = messageData.mimeType;
    mediaData.fileURL = messageData.fileURL;
  }
  const message = await prisma.message.create({
    data: {
      conversation: {
        connect: {
          id: conversationId,
        },
      },
      sender: {
        connect: {
          id: senderId,
        },
      },
      content: messageData.content,
      type: messageData.type,
      ...mediaData,
      ...(messageData.repliedMessageId
        ? {
            repliedMessage: {
              connect: { id: messageData.repliedMessageId },
            },
          }
        : {}),
    },
    include: {
      sender: {
        include: {
          profile: true,
          preferences: true,
        },
      },
    },
  });
  return message;
}

async function getConversationMessages(
  conversationId,
  options = {},
  currentUserId,
) {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      permissions: true,
    },
  });
  if (!conversation) {
    throw new HttpError("Conversation does not exist.", 404);
  }  
  const permissions = conversation.permissions;

  const existingParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: conversationId,
        userId: currentUserId,
      },
    },
  });

  const isCurrentUserParticipant = !!existingParticipant;
  if (!isCurrentUserParticipant && conversation.type === "DIRECT") {
    throw new HttpError(
      "It is unallowed to see others' conversation messages",
      403,
    );
  }
  const messages = await prisma.message.findMany({
    ...options,
    where: {
      conversationId: Number(conversationId),
      ...(options.where || {}),
    },

    include: {
      sender: {
        include: {
          profile: true,
          bannedUsers: {
            where: {
              bannedUserId: currentUserId,
            },
          },
          preferences: true,
        },
      },
      repliedMessage: {
        include: {
          sender: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              username: true,
              accountColor: true,
            },
          },
        },
      },
      readers: true,
      reactions: {
        include: {
          reactor: {
            include: {
              user: {
                select: {
                  firstname: true,
                  lastname: true,
                  accountColor: true,
                  profile: {
                    select: {
                      avatar: true,
                    },
                  },
                  preferences: true,
                },
              },
            },
          },
        },
      },
      ...(options.include || {}),
    },
  });
  const filteredMessages = filterMessagesByPermissions(
    messages,
    permissions,
    isCurrentUserParticipant,
  );
  return filteredMessages;
}

async function getMessageReaders(conversationId, messageId, currentUserId) {
  const permissions =
    await conversationService.getConversationPermissions(conversationId);

  const existingParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: Number(conversationId),
        userId: Number(currentUserId),
      },
    },
  });
  const isCurrentUserParticipant = !!existingParticipant;
  let currentUserAdminData;
  if (currentUserId) {
    currentUserAdminData = await prisma.conversationAdmin.findUnique({
      where: {
        conversationId_userId: {
          conversationId: Number(conversationId),
          userId: Number(currentUserId),
        },
      },
    });
  }

  const message = await prisma.message.findUnique({
    where: { id: Number(messageId) },
  });
  if (!message) {
    throw new HttpError("Message is not found.", 404);
  }

  let readers = [];
  if (permissions?.messageReaders || !!currentUserAdminData) {
    readers = await prisma.messageOnReader.findMany({
      where: { messageId: Number(messageId) },
      include: {
        reader: {
          include: {
            profile: true,
            preferences: true,
            bannedUsers: {
              where: {
                bannedUserId: currentUserId,
              },
            },
          },
        },
      },
    });
  }

  const filteredReaders =
    readers.length > 0
      ? readers.map((readerData) => ({
          ...readerData,
          reader: filterUser(
            readerData.reader,
            readerData.preferences,
            permissions,
            isCurrentUserParticipant,
          ),
        }))
      : [];
  return filteredReaders;
}

async function deleteMessage(messageId, currentUserId) {
  const message = await prisma.message.findUnique({
    where: { id: Number(messageId) },
    include: {
      conversation: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!message) {
    throw new HttpError("Message is not found.", 404);
  }
  const currentUserAdminRecord = await prisma.conversationAdmin.findUnique({
    where: {
      conversationId_userId: {
        conversationId: message.conversation.id,
        userId: currentUserId,
      },
    },
  });
  if (message.senderId !== currentUserId || !currentUserAdminRecord) {
    throw new HttpError("Deleting others's message is forbidden.", 401);
  }

  await prisma.message.delete({ where: { id: Number(messageId) } });
  return { message: "Message is deleted successfully." };
}

async function editMessage(messageId, data, currentUserId) {
  const message = await prisma.message.findUnique({
    where: { id: Number(messageId) },
  });
  if (!message) {
    throw new HttpError("Message is not found.", 404);
  }
  if (message.senderId !== currentUserId) {
    throw new HttpError("Editing others's message is forbidden.", 401);
  }

  const updatedMessage = await prisma.message.update({
    where: { id: Number(messageId) },
    data: {
      edit: true,
      content: data.content,
      mimeType: data.mimeType,
      fileURL: data.fileURL,
      type: data.type,
    },
  });
  return updatedMessage;
}

module.exports = {
  getUnReadMessages,
  createMessage,
  getConversationMessages,
  getMessageReaders,
  deleteMessage,
  editMessage,
};
