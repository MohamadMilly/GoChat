const prisma = require("../../lib/prisma");

module.exports = async (
  socket,
  io,
  participantsIds,
  prevParticipantsIds,
  conversationId,
  callback,
) => {
  try {
    const convIdInt = parseInt(conversationId);

    const conversation = await prisma.conversation.findUnique({
      where: { id: convIdInt },
      include: { participants: true },
    });

    if (!conversation)
      return typeof callback === "function" ? callback({ status: 404 }) : null;

    const sockets = await io.fetchSockets();

    const socketMap = new Map(
      sockets.map((s) => [Number(s.handshake.auth.userId), s]),
    );

    const participantsIdsSet = new Set(participantsIds.map(Number));
    const prevParticipantsIdsSet = new Set(prevParticipantsIds.map(Number));

    for (let pId of prevParticipantsIds) {
      if (!participantsIdsSet.has(pId)) {
        socketMap
          .get(pId)
          ?.emit("leave conversation", true, "_", "_", convIdInt.toString());
      }
    }

    for (let pId of participantsIdsSet) {
      const currentSocket = socketMap.get(pId);
      if (!currentSocket) continue;

      const isNew = !prevParticipantsIdsSet.has(pId);
      currentSocket.emit("edit conversation", isNew, convIdInt);
    }

    if (typeof callback === "function") callback({ status: "ok" });
  } catch (err) {
    console.error("Error in edit conversation:", err);
    if (typeof callback === "function") callback({ status: 500 });
  }
};
