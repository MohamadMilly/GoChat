module.exports = (socket, io, withDelete, fullname, userId, conversationId) => {
  if (!conversationId) {
    return;
  } else {
    socket.broadcast
      .to(conversationId)
      .emit("leave conversation", withDelete, fullname, userId, conversationId);
  }
};
