const prisma = require("../../lib/prisma");
const filterProfile = require("../../utils/filterProfile");

async function processChatMessage(
  socket,
  io,
  message,
  conversationId,
  clientOffset,
  callback,
) {
  const convId = String(conversationId);
  const userId = socket.handshake.auth.userId;
  if (!userId) return;
  try {
    const conversationData = await prisma.conversation.findUnique({
      where: {
        id: parseInt(convId),
      },
      include: {
        participants: true,
      },
    });
    if (!conversationData) {
      throw new Error("conversation does not exist");
    }

    const userPreferences = await prisma.preferences.findUnique({
      where: {
        userId: userId,
      },
    });
    let createdMessage;

    const permissions = await prisma.permissions.findUnique({
      where: {
        conversationId: parseInt(conversationId),
      },
    });
    const admin = await prisma.conversationAdmin.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId: parseInt(userId),
        },
      },
    });
    if (!permissions?.sendingMessages && !admin) {
      throw new Error(
        "Sending messages is not allowed due to permissions restrictions.",
      );
    }

    if (
      !permissions.sendingMedia &&
      !admin &&
      !message.mimeType.includes("text") &&
      !(message.type === "TEXT")
    ) {
      return callback({
        status: 401,
        error:
          "Sending media messages is not allowed due to permissions restrictions.",
      });
    }

    await prisma.conversation.update({
      where: { id: parseInt(convId, 10) },
      data: { updatedAt: new Date() },
    });

    const senderBannedUsers = await prisma.ban.findMany({
      where: {
        banningUserId: parseInt(userId),
      },
    });
    const senderBanningUsers = await prisma.ban.findMany({
      where: {
        bannedUserId: parseInt(userId),
      },
    });
    const senderBannedUsersIds =
      senderBannedUsers.length > 0
        ? senderBannedUsers.map(
            (senderBannedUser) => senderBannedUser.bannedUserId,
          )
        : [];

    const socketInConversations = await io.in(convId).fetchSockets();

    if (conversationData.type === "DIRECT") {
      const chatPartnerSocket = socketInConversations.find(
        (socket) => socket.handshake.auth.userId !== parseInt(userId),
      );
      const chatPartnerBanningUsers = await prisma.ban.findMany({
        where: {
          banningUserId: chatPartnerSocket
            ? chatPartnerSocket.handshake.auth.userId
            : -1,
        },
      });
      if (
        conversationData.participants.some(
          (p) =>
            senderBannedUsersIds.includes(p.userId) ||
            chatPartnerBanningUsers.find(
              (banningUserObj) =>
                banningUserObj.bannedUserId === parseInt(userId),
            ),
        )
      ) {
        return callback({
          status: 401,
          error:
            "one of the chat partners banned the other from sending messages",
        });
      }
      createdMessage = await prisma.message.create({
        data: {
          sender: {
            connect: {
              id: userId,
            },
          },
          conversation: {
            connect: {
              id: parseInt(convId),
            },
          },
          content: message.content,
          fileURL: message.fileURL,
          mimeType: message.mimeType,
          type: message.type,
          clientOffset: clientOffset,
          repliedMessage: message.repliedMessageId
            ? {
                connect: {
                  id: message.repliedMessageId,
                },
              }
            : undefined,
        },
        include: {
          sender: {
            include: {
              profile: true,
            },
          },
          repliedMessage: {
            include: {
              sender: true,
            },
          },
          reactions: true,
          readers: true,
        },
      });
      createdMessage = {
        ...createdMessage,
        sender: filterProfile(createdMessage.sender, [userPreferences]),
      };
      io.to(convId).emit(
        "chat message",
        createdMessage,
        convId,
        createdMessage.id,
        message.createdAt, // This date for the optimistic message replacement logic
      );
      return callback({
        status: "ok",
      });
    } else if (conversationData.type === "GROUP") {
      createdMessage = await prisma.message.create({
        data: {
          sender: {
            connect: {
              id: userId,
            },
          },
          conversation: {
            connect: {
              id: parseInt(convId),
            },
          },
          content: message.content,
          fileURL: message.fileURL,
          mimeType: message.mimeType,
          type: message.type,
          clientOffset: clientOffset,
          repliedMessage: message.repliedMessageId
            ? {
                connect: {
                  id: message.repliedMessageId,
                },
              }
            : undefined,
        },
        include: {
          sender: {
            include: {
              profile: true,
            },
          },
          repliedMessage: {
            include: {
              sender: true,
            },
          },
          reactions: true,
        },
      });
      createdMessage = {
        ...createdMessage,
        sender: filterProfile(createdMessage.sender, [userPreferences]),
      };
      socketInConversations.forEach((socket) => {
        const socketUserId = socket.handshake.auth.userId;
        if (senderBannedUsersIds.includes(Number(socketUserId))) {
          socket.emit(
            "chat message",
            {
              ...createdMessage,
              sender: {
                ...createdMessage.sender,
                profile: null,
              },
            },
            convId,
            createdMessage.id,
            message.createdAt,
          );
        } else {
          socket.emit(
            "chat message",
            createdMessage,
            convId,
            createdMessage.id,
            message.createdAt, // This date for the optimistic message replacement logic
          );
        }
      });
      callback({
        status: "ok",
      });
    }
  } catch (err) {
    console.error("socket error: ", err);
    callback({
      status: 500,
      error: err.message,
    });
    if (err.code === "P2002") {
    }
    return;
  }
}

module.exports = processChatMessage;
