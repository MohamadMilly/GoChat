const jwt = require("jsonwebtoken");

// import enviroment variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const bcrypt = require("bcryptjs");

const prisma = require("../lib/prisma");
const filterProfile = require("../utils/filterProfile");

const sendMessagePost = async (req, res) => {
  const currentUser = req.currentUser;
  const conversationId = req.params.conversationId;
  const { content, type, fileURL, mimeType } = req.body;
  try {
    const createdMessage = await prisma.message.create({
      data: {
        sender: {
          connect: {
            id: currentUser.id,
          },
        },
        conversation: {
          connect: {
            id: parseInt(conversationId),
          },
        },
        content: content || "",
        type: type,
        fileURL: fileURL || "",
        mimeType: mimeType || "",
      },
    });
    return res.json({
      message: createdMessage,
    });
  } catch (err) {
    return res.json({
      message: "Unexpected error happened while sending the message.",
    });
  }
};

const getConversationMessagesGet = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: parseInt(conversationId),
      },
    });
    if (!conversation) {
      return res.status(404).json({
        message: "Conversation is not found.",
      });
    }
    const participantsIds = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      select: {
        userId: true,
      },
    });
    const participantsPreferences = await prisma.preferences.findMany({
      where: {
        userId: {
          in: participantsIds.map((p) => p.userId),
        },
      },
    });
    const messages = await prisma.message.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
    });
    const filteredMessages = messages.map((message) => {
      return {
        ...message,
        sender: filterProfile(message.sender, participantsPreferences),
      };
    });
    return res.json({
      messages: filteredMessages,
      type: conversation.type,
    });
  } catch (err) {
    return res.status(500).json({
      message:
        "Unexpected Error happened while getting this conversation messages",
    });
  }
};

module.exports = { sendMessagePost, getConversationMessagesGet };
