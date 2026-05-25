const express = require("express");

const conversationsRouter = express.Router();

const verifyToken = require("../middlewares/auth/verifyToken");
const extractToken = require("../middlewares/auth/extractToken");
// controllers
const conversationsController = require("../controllers/conversationsController");
const messagesCountroller = require("../controllers/messagesController");

conversationsRouter.get("/", conversationsController.queryGroupsGet);

conversationsRouter.get(
  "/:conversationId/messages/:messageId/readers",
  messagesCountroller.getMessageReaders,
);

conversationsRouter.get(
  "/:conversationId/permissions",
  conversationsController.conversationPermissionsGet,
);

conversationsRouter.use(extractToken);
conversationsRouter.use(verifyToken);

conversationsRouter.get(
  "/:conversationId",
  conversationsController.getSpecificConversationGet,
);

conversationsRouter.get(
  "/:conversationId/messages",
  messagesCountroller.getConversationMessagesGet,
);

conversationsRouter.post(
  "/",
  conversationsController.createNewConversationPost,
);
conversationsRouter.post(
  "/:conversationId/messages",
  messagesCountroller.sendMessagePost,
);

conversationsRouter.post(
  "/:conversationId",
  conversationsController.joinConversationPost,
);

conversationsRouter.post(
  "/:conversationId/participants",
  conversationsController.addParticipantPost,
);

conversationsRouter.delete(
  "/:conversationId/participants/:participantId",
  conversationsController.removeParticipantDelete,
);

conversationsRouter.post(
  "/:conversationId/admins",
  conversationsController.addAdminPost,
);

conversationsRouter.delete(
  "/:conversationId/admins/:userId",
  conversationsController.removeAdminDelete,
);

conversationsRouter.delete(
  "/:conversationId/messages/:messageId",
  messagesCountroller.deleteMessageDelete,
);

conversationsRouter.put(
  "/:conversationId",
  conversationsController.editGroupPut,
);

conversationsRouter.put(
  "/:conversationId/messages/:messageId",
  messagesCountroller.editMessagePut,
);

conversationsRouter.put(
  "/:conversationId/permissions",
  conversationsController.conversationPermissionsPut,
);

conversationsRouter.delete(
  "/:conversationId",
  conversationsController.leaveOrDeleteConversationDelete,
);

module.exports = conversationsRouter;
