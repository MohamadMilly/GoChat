module.exports = async (socket, io, userId, conversationId) => {
  const sockets = await io.fetchSockets();
  const unBlockedSocket = sockets.find(
    (s) => s.handshake.auth.userId == userId,
  );

  if (unBlockedSocket) {
    unBlockedSocket.emit(
      "unblock user",
      socket.handshake.auth.userId,
      conversationId,
    );
  } else {
    return;
  }
};
