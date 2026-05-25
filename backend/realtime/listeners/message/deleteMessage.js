const prisma = require("../../../lib/prisma");

module.exports = async (socket, io, messageId, conversationId, callback) => {
  const userId = socket.handshake.auth.userId;
  try {
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });
    if (!message) {
      if (typeof callback === "function") callback({ status: 404 });
      return;
    }
    const userAdminData = await prisma.conversationAdmin.findUnique({
      where: {
        conversationId_userId: {
          userId: Number(userId),
          conversationId: Number(conversationId),
        },
      },
    });

    if (message.senderId !== userId && !userAdminData) {
      if (typeof callback === "function") callback({ status: 401 });
      return;
    }
    const deletedReadersPromise = prisma.messageOnReader.deleteMany({
      where: {
        messageId: messageId,
      },
    });
    const deleteReactionsPromise = prisma.reaction.deleteMany({
      where: {
        messageId: messageId,
      },
    });
    const deletedMessagePromise = prisma.message.delete({
      where: {
        id: messageId,
        senderId: message.senderId,
      },
    });
    await prisma.$transaction([
      deletedReadersPromise,
      deleteReactionsPromise,
      deletedMessagePromise,
    ]);
    if (typeof callback === "function") callback({ status: "ok" });
    io.emit("delete message", messageId, conversationId);
  } catch (err) {
    if (typeof callback === "function") callback({ status: 500 });
  }
};
