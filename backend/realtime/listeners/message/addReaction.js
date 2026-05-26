const prisma = require("../../../lib/prisma");
const conversationService = require("../../../services/conversation/conversationService");
const filterUser = require("../../../shared/utils/filterUser");

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
          conversationId: Number(conversationId),
          userId: userId,
        },
      },
      include: {
        user: {
          select: {
            preferences: true,
          },
        },
      },
    });
    if (!userInConversation) {
      return callback({
        status: 404,
        message: `User is not found in this conversation with ID ${conversationId}`,
      });
    }
    const permissions = await conversationService.getConversationPermissions(
      Number(conversationId),
    );
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
              conversationId: Number(conversationId),
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
                profile: true,
                preferences: true,
                accountColor: true,
                profile: {
                  select: {
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const filteredReaction = {
      ...reaction,
      reactor: {
        ...reaction.reactor,
        user: filterUser(
          reaction.reactor.user,
          userInConversation.user.preferences,
          permissions,
          true,
        ),
      },
    };
    console.log(filteredReaction);
    socket.broadcast
      .to(conversationId.toString())
      .emit("reaction", filteredReaction);
    callback({ status: "ok" });
  } catch (err) {
    callback({
      status: 500,
    });
    console.error(err);
  }
}

module.exports = reactToMessage;
