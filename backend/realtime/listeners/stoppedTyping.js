module.exports = (socket, io, conversationId) => {
  const userId = socket.handshake.auth.userId;
  socket.broadcast.to(String(conversationId)).emit("stopped typing", userId);
};
