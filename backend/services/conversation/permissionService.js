const prisma = require("../../lib/prisma");
const HttpError = require("../../shared/errors/HttpError");

async function getConversationPermissions(conversationId) {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      permissions: true,
    },
  });
  if (!conversation) {
    throw new HttpError("Conversation is not found.", 404);
  }
  
  return conversation.permissions || {};
}

async function editConversationPermissions(
  conversationId,
  editorId,
  {
    sendingMessages,
    sendingMedia,
    onlineMembers,
    hideUsersForVisitors,
    messageReaders,
    viewMembers,
  },
) {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
  });
  if (!conversation) {
    throw new HttpError("Conversation is not found.", 404);
  }
  const conversationAdminRecord = await prisma.conversationAdmin.findUnique({
    where: {
      conversationId_userId: {
        conversationId: conversationId,
        userId: editorId,
      },
    },
  });
  if (!conversationAdminRecord) {
    throw new HttpError(
      "Only admin can edit this conversation permissions.",
      403,
    );
  }
  const updatedPermissions = await prisma.permissions.update({
    where: {
      conversationId: conversationId,
    },
    data: {
      sendingMessages,
      sendingMedia,
      onlineMembers,
      hideUsersForVisitors,
      messageReaders,
      viewMembers,
    },
  });
  return updatedPermissions;
}

module.exports = {
  getConversationPermissions,
  editConversationPermissions,
};
