function joinConversation(socket, io, conversationId) {
  if (!conversationId) return;
  socket.join(conversationId.toString());
}

module.exports = joinConversation;
