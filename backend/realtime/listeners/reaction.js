const prisma = require("../../lib/prisma");

async function reactToMessage(
  socket,
  io,
  messageId,
  userId,
  conversationId,
  type,
  callback,
) {
  if (!messageId || !userId || !type)
    return callback({
      status: 400,
      message: "Message ID , User ID and Reaction type are required",
    });

  try {
    const userInConversation = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
    });
    if (!userInConversation) {
      return callback({
        status: 404,
        message: `User is not found in this conversation with ID ${conversationId}`,
      });
    }

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });
    if (!message) {
      return callback({
        status: 404,
        message: "Message is not found.",
      });
    }
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        reactorId: userId,
        messageId: messageId,
      },
    });
    if (existingReaction) {
      if (existingReaction.type !== type) {
        await prisma.reaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
        socket.broadcast
          .to(conversationId.toString())
          .emit(
            "remove reaction",
            conversationId,
            messageId,
            existingReaction.id,
          );
      } else {
        await prisma.reaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
        socket.broadcast
          .to(conversationId.toString())
          .emit(
            "remove reaction",
            conversationId,
            messageId,
            existingReaction.id,
          );
        return callback({
          status: "ok",
        });
      }
    }
    const reaction = await prisma.reaction.create({
      data: {
        message: {
          connect: {
            id: messageId,
          },
        },
        reactor: {
          connect: {
            conversationId_userId: {
              conversationId: conversationId,
              userId: userId,
            },
          },
        },
        type: type,
      },
      include: {
        reactor: {
          include: {
            user: {
              select: {
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
    });
    socket.broadcast.to(conversationId.toString()).emit("reaction", reaction);
    callback({ status: "ok" });
  } catch (err) {
    callback({
      status: 500,
    });
    console.error(err.stack);
  }
}

module.exports = reactToMessage;
