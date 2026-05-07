module.exports = (socket, io, conversationId, fullname) => {
  if (!conversationId) {
    return;
  } else {
    socket.broadcast
      .to(conversationId)
      .emit("join conversation", conversationId, fullname);
  }
};
