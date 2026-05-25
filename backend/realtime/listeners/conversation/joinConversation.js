function joinConversation(socket, io, conversationId) {
  if (!conversationId) return;
  socket.join(String(conversationId));
}

module.exports = joinConversation;
