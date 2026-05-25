const prisma = require("../../../lib/prisma");
const filterProfile = require("../../../shared/utils/filterProfile");
const filterUser = require("../../../shared/utils/filterUser");

async function onChatMessage(
  socket,
  io,
  message,
  conversationId,
  clientOffset,
  callback,
) {
  const convId = String(conversationId);
  const numericConvId = parseInt(convId, 10);
  const userId = socket.handshake.auth.userId;

  if (!userId || isNaN(numericConvId)) {
    return callback({
      status: 400,
      error: "Invalid context or missing inputs.",
    });
  }

  try {
    const [conversationData, userPreferences, permissions, admin] =
      await Promise.all([
        prisma.conversation.findUnique({
          where: { id: numericConvId },
          include: { participants: true },
        }),
        prisma.preferences.findUnique({ where: { userId } }),
        prisma.permissions.findUnique({
          where: { conversationId: numericConvId },
        }),
        prisma.conversationAdmin.findUnique({
          where: {
            conversationId_userId: { conversationId: numericConvId, userId },
          },
        }),
      ]);

    if (!conversationData) {
      return callback({ status: 404, error: "Conversation does not exist" });
    }

    if (!permissions?.sendingMessages && !admin) {
      return callback({
        status: 403,
        error: "Sending messages is restricted.",
      });
    }

    const isMedia =
      message.mimeType &&
      !message.mimeType.includes("text") &&
      message.type !== "TEXT";
    if (isMedia && !permissions.sendingMedia && !admin) {
      return callback({ status: 403, error: "Sending media is restricted." });
    }

    const otherParticipantIds = conversationData.participants
      .map((p) => p.userId)
      .filter((id) => id !== userId);

    const activeBans = await prisma.ban.findMany({
      where: {
        OR: [
          { banningUserId: userId, bannedUserId: { in: otherParticipantIds } },
          { banningUserId: { in: otherParticipantIds }, bannedUserId: userId },
        ],
      },
    });

    if (conversationData.type === "DIRECT" && activeBans.length > 0) {
      return callback({
        status: 403,
        error: "Interaction blocked due to privacy bans.",
      });
    }

    const senderBannedUserIds = activeBans
      .filter((ban) => ban.banningUserId === userId)
      .map((ban) => ban.bannedUserId);

    const [createdMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          sender: { connect: { id: userId } },
          conversation: { connect: { id: numericConvId } },
          content: message.content,
          fileURL: message.fileURL,
          mimeType: message.mimeType,
          type: message.type,
          clientOffset: clientOffset,
          repliedMessage: message.repliedMessageId
            ? { connect: { id: message.repliedMessageId } }
            : undefined,
        },
        include: {
          sender: { include: { profile: true, preferences: true } },
          repliedMessage: { include: { sender: true } },
          reactions: true,
          readers: true,
        },
      }),
      prisma.conversation.update({
        where: { id: numericConvId },
        data: { updatedAt: new Date() },
      }),
    ]);

    const sanitizedMessage = {
      ...createdMessage,
      sender: filterUser(
        createdMessage.sender,
        createdMessage.sender.preferences,
        permissions,
        true,
      ),
    };

    if (
      conversationData.type === "DIRECT" ||
      senderBannedUserIds.length === 0
    ) {
      const activeRoomSockets = await io.in(String(convId)).fetchSockets();
      console.log(
        `Sockets currently in room ${convId}:`,
        activeRoomSockets.map((s) => s.id),
      );
      io.to(convId).emit(
        "chat message",
        sanitizedMessage,
        convId,
        createdMessage.id,
        message.createdAt,
      );
    } else {
      const activeSockets = await io.in(convId).fetchSockets();
      for (const targetSocket of activeSockets) {
        const targetUserId = targetSocket.handshake.auth.userId;
        if (senderBannedUserIds.includes(Number(targetUserId))) {
          targetSocket.emit(
            "chat message",
            {
              ...sanitizedMessage,
              sender: { ...sanitizedMessage.sender, profile: null },
            },
            convId,
            createdMessage.id,
            message.createdAt,
          );
        } else {
          targetSocket.emit(
            "chat message",
            sanitizedMessage,
            convId,
            createdMessage.id,
            message.createdAt,
          );
        }
      }
    }

    return callback({ status: "ok" });
  } catch (err) {
    console.error("Socket transaction failed:", err);

    if (err.code === "P2002") {
      return callback({
        status: "ok",
        message: "Duplicate offset processed successfully.",
      });
    }

    return callback({
      status: 500,
      error: err.message || "Internal transmission failure.",
    });
  }
}

module.exports = onChatMessage;
