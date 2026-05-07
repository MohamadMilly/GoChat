module.exports = async (socket, io, participantsIds) => {
  if (!Array.isArray(participantsIds)) return;
  const participantsSockets = await io.fetchSockets();
  const participantsIdsSocketsMap = new Map(
    participantsSockets.map((s) => [Number(s.handshake.auth.userId), s]),
  );
  participantsSockets.forEach((s) => {
    const userId = s.handshake.auth.userId;
    if (participantsIdsSocketsMap.has(userId)) {
      s.emit("create conversation");
    }
  });
};
