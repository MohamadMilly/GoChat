const prisma = require("../../../lib/prisma");

module.exports = async (socket, io, message, conversationId, callback) => {
  if (!message || !conversationId) return;
  const userId = socket.handshake.auth.userId;
  try {
    const dbMessage = await prisma.message.findUnique({
      where: {
        id: message.id,
      },
    });
    if (!dbMessage) {
      if (typeof callback === "function") callback({ status: 404 });
      return;
    }
    if (userId !== dbMessage.senderId) {
      if (typeof callback === "function") callback({ status: 401 });
      return;
    }

    const updatedMessage = await prisma.message.update({
      where: {
        id: message.id,
      },
      data: {
        content: message.content,
        mimeType: message.mimeType,
        type: message.type,
        fileURL: message?.fileURL || "",
        edit: true,
      },
      include: {
        sender: true,
        reactions: true,
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
      },
    });
    if (typeof callback === "function") callback({ status: "ok" });
    socket.broadcast
      .to(conversationId)
      .emit("edit message", updatedMessage, conversationId);
  } catch (err) {
    if (typeof callback === "function") callback({ status: 500 });
  }
};
