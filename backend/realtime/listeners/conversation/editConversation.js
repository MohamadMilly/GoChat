const prisma = require("../../../lib/prisma");

module.exports = async (socket, io, conversationId) => {
  io.to(conversationId).emit("edit conversation", conversationId);
};
