function publishTyping(socket, io, conversationId) {
  const userId = socket.handshake.auth.userId;
  const convId = String(conversationId);
  socket.broadcast.to(convId).emit("typing", userId, convId);
}

module.exports = publishTyping;
