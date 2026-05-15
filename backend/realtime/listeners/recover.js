const prisma = require("../../lib/prisma");
const filterProfile = require("../../utils/filterProfile");

async function recover(socket, io, offsets) {
  const userId = socket.handshake.auth.userId;
  if (!userId) return;
  for (let [convId, lastId] of Object.entries(offsets)) {
    const missedMessagesInThisConversation = await prisma.message.findMany({
      where: {
        conversationId: Number(convId),
        id: {
          gt: Number(lastId) || 0,
        },
      },
      include: {
        sender: {
          include: {
            profile: {
              where: {
                NOT: {
                  userId: {
                    in: (
                      await prisma.$queryRawUnsafe(
                        `SELECT "banningUserId" FROM "Ban" WHERE "bannedUserId" = $1`,
                        userId,
                      )
                    ).map((banningUserObj) => banningUserObj.banningUserId),
                  },
                },
              },
            },
          },
        },
        repliedMessage: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    for (let message of missedMessagesInThisConversation) {
      if (userId === message.senderId) continue;
      const senderPreferences = await prisma.preferences.findUnique({
        where: {
          userId: message.senderId,
        },
      });
      const filtered = {
        ...message,
        sender: filterProfile(message.sender, [senderPreferences]),
      };
      socket.emit("chat message", filtered, convId, message.id);
    }
    socket.join(convId);
  }
}

module.exports = recover;
