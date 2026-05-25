const jwt = require("jsonwebtoken");

// import enviroment variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const bcrypt = require("bcryptjs");

const prisma = require("../lib/prisma");
const messageService = require("../services/message/messageService");
const conversationService = require("../services/conversation/conversationService");
const HttpError = require("../shared/errors/HttpError");

const sendMessagePost = async (req, res) => {
  const currentUser = req.currentUser;
  const conversationId = req.params.conversationId;
  const { content, type, fileURL, mimeType, repliedMessageId } = req.body;
  try {
    const createdMessage = messageService.createMessage(
      { content, type, fileURL, mimeType, repliedMessageId },
      currentUser.id,
      Number(conversationId),
    );

    return res.json({
      message: createdMessage,
    });
  } catch (err) {
    next(err);
  }
};

const getConversationMessagesGet = async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.currentUser.id;
  const conversation = await conversationService.getConversation(
    Number(conversationId),
  );
  if (!conversation) {
    throw new HttpError("Conversation is not found", 404);
  }
  
  const oldCursor =
    req.query.cursor && req.query.cursor !== "null"
      ? Number(req.query.cursor)
      : null;

  try {
    const options = {
      take: 20,
      skip: oldCursor ? 1 : 0,
      ...(oldCursor && {
        cursor: {
          id: oldCursor,
        },
      }),

      orderBy: {
        createdAt: "desc",
      },
    };
    
    const messages = await messageService.getConversationMessages(
      Number(conversationId),
      options,
      userId,
    );
    /* to keep the order of messages asc by timestamp */
    let reversedMessages = messages.reverse();
    let nextCursor =
      reversedMessages.length > 0 ? reversedMessages[0].id : null;
    
    return res.json({
      type: conversation.type,
      messages: reversedMessages,
      nextCursor: nextCursor,
    });
  } catch (err) {
    next(err);
  }
};

const getMessageReaders = async (req, res, next) => {
  const { messageId, conversationId } = req.params;
  const { userId: userIdString } = req.query;
  const userId = parseInt(userIdString);
  try {
    const readers = await messageService.getMessageReaders(
      Number(conversationId),
      Number(messageId),
      userId,
    );

    return res.json({ readers });
  } catch (err) {
    next(err);
  }
};

const deleteMessageDelete = async (req, res) => {
  const currentUser = req.currentUser;
  const { messageId } = req.params;
  try {
    const result = await messageService.deleteMessage(
      messageId,
      currentUser.id,
    );
    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      message: "unexpected error happened while deleting this message.",
    });
  }
};

const editMessagePut = async (req, res) => {
  const currentUser = req.currentUser;
  const { messageId } = req.params;
  const { content, mimeType, fileURL, type } = req.body;
  try {
    const updatedMessage = await messageService.editMessage(
      messageId,
      { content, mimeType, fileURL, type },
      currentUser.id,
    );
    return res.json({
      message: "Message is updated successfully.",
      updatedMessage,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unexpected error happened while editing message.",
    });
  }
};

module.exports = {
  sendMessagePost,
  getConversationMessagesGet,
  getMessageReaders,
  deleteMessageDelete,
  editMessagePut,
};
