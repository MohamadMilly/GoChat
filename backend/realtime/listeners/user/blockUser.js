module.exports = async (socket, io, userId, conversationId) => {
  const sockets = await io.fetchSockets();
  const blockedSocket = sockets.find((s) => s.handshake.auth.userId == userId);
  
  if (blockedSocket) {
    blockedSocket.emit(
      "block user",
      socket.handshake.auth.userId,
      conversationId,
    );
  } else {
    return;
  }
};
