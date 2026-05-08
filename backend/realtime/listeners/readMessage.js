const prisma = require("../../lib/prisma");

module.exports = async (
  socket,
  io,
  conversationId,
  messageId,
  readerId,
  callback,
) => {
  if (!messageId || !readerId || !conversationId) return;
  try {
    const messageOnReader = await prisma.messageOnReader.findUnique({
      where: {
        messageId_readerId: {
          messageId: parseInt(messageId),
          readerId: parseInt(readerId),
        },
      },
    });
    if (messageOnReader) {
      if (typeof callback === "function") callback({ status: 400 });
      return;
    }
    await prisma.messageOnReader.upsert({
      where: {
        messageId_readerId: {
          messageId: parseInt(messageId),
          readerId: parseInt(readerId),
        },
      },
      create: {
        message: {
          connect: {
            id: parseInt(messageId),
          },
        },
        reader: {
          connect: {
            id: parseInt(readerId),
          },
        },
      },
      update: {},
    });
    io.emit("read message", conversationId, messageId, readerId);
    if (typeof callback === "function") callback({ status: "ok" });
  } catch (err) {
    if (typeof callback === "function") callback({ status: 500 });
  }
};
