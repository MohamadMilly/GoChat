module.exports = (socket, io, conversationId) => {
  if (!conversationId) {
    return;
  } else {
    io.to(conversationId).emit("edit permissions", conversationId);
  }
};
