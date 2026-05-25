const prisma = require("../../../lib/prisma");
const filterProfile = require("../../../shared/utils/filterProfile");
const conversationService = require("../../../services/conversation/conversationService");
const messagesService = require("../../../services/message/messageService");
const filterUser = require("../../../shared/utils/filterUser");

async function recover(socket, io, offsets) {
  const userId = socket.handshake.auth.userId;
  if (!userId || !offsets) return;
  console.log("RECOVERED");
  for (let [convId, lastId] of Object.entries(offsets)) {
    socket.join(String(convId));
    const permissions = await conversationService.getConversationPermissions(
      Number(convId),
    );
    const options = {
      where: {
        id: {
          gt: Number(lastId) || 0,
        },
      },
      include: {
        sender: {
          include: {
            profile: true,
            preferences: true,
            bannedUsers: {
              where: {
                bannedUserId: userId,
              },
            },
          },
        },
        repliedMessage: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    };
    const missedMessagesInThisConversation =
      await messagesService.getConversationMessages(
        Number(convId),
        options,
        userId,
      );

    for (let message of missedMessagesInThisConversation) {
      if (userId === message.senderId) continue;

      const filtered = {
        ...message,
        sender: filterUser(
          message.sender,
          message.sender.preferences,
          permissions,
          true,
        ),
      };
      socket.emit("chat message", filtered, convId, message.id);
    }
  }
}

module.exports = recover;
