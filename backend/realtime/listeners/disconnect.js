const prisma = require("../../lib/prisma");
const { handleDisconnection } = require("../../utils/connectionUtils");

async function disconnect(socket, io) {
  const userId = socket.handshake.auth.userId;
  const hasDisconnected = handleDisconnection(userId);

  try {
    if (hasDisconnected) {
      io.emit("user disconnected", userId);
    }
    await prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        lastSeen: new Date(),
      },
    });
  } catch (err) {
    console.log(`ERROR (${err.status}): `, err.message);
  }
}

module.exports = disconnect;
