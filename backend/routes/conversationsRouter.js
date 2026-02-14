const express = require("express");

const conversationsRouter = express.Router();

const verifyToken = require("../middlewares/verifyToken");
// controllers
const conversationsController = require("../controllers/conversationsController");
const messagesCountroller = require("../controllers/messagesController");

const jwt = require("jsonwebtoken");

require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

conversationsRouter.get(
  "/:conversationId",
  conversationsController.getSpecificConversationGet,
);

conversationsRouter.get("/", conversationsController.queryGroupsGet);

conversationsRouter.get(
  "/:conversationId/messages",
  messagesCountroller.getConversationMessagesGet,
);

conversationsRouter.get(
  "/:conversationId/messages/:messageId/readers",
  messagesCountroller.getMessageReaders,
);

conversationsRouter.use(verifyToken, (req, res, next) => {
  const token = req.token;
  try {
    const authData = jwt.verify(token, SECRET_KEY);
    const user = authData.user;
    req.currentUser = user;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
});

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

module.exports = conversationsRouter;
