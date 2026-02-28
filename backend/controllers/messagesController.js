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
  const { content, type, fileURL, mimeType, repliedMessageId } = req.body;
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
        repliedMessage: repliedMessageId
          ? {
              connect: {
                id: parseInt(repliedMessageId),
              },
            }
          : null,
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
        repliedMessage: {
          include: {
            sender: true,
          },
        },
        readers: {
          include: {
            reader: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
                profile: true,
              },
            },
          },
        },
      },
    });
    const filteredMessages = messages.map((message) => {
      return {
        ...message,
        readers: message.readers.map((readerOnMessage) =>
          filterProfile(readerOnMessage.reader, participantsPreferences),
        ),
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

const getMessageReaders = async (req, res) => {
  const { messageId } = req.params;
  try {
    const message = await prisma.message.findUnique({
      where: {
        id: parseInt(messageId),
      },
    });
    if (!message) {
      return res.status(404).json({
        message: "Message is not found.",
      });
    }
    const readers = await prisma.messageOnReader.findMany({
      where: {
        messageId: parseInt(messageId),
      },
      include: {
        reader: {
          include: {
            profile: true,
          },
        },
      },
    });
    const readersPreferences = await prisma.preferences.findMany({
      where: {
        userId: {
          in: readers.map((reader) => reader.readerId),
        },
      },
    });
    const filteredReaders = readers.map((messageOnReader) => ({
      ...messageOnReader,
      reader: filterProfile(messageOnReader.reader, readersPreferences),
    }));

    return res.json({
      readers: filteredReaders,
    });
  } catch (err) {
    return res.json({});
  }
};

const deleteMessageDelete = async (req, res) => {
  const currentUser = req.currentUser;
  const { messageId } = req.params;
  try {
    const message = await prisma.message.findUnique({
      where: {
        id: parseInt(messageId),
      },
    });
    if (!message) {
      return res.status(403).json({
        message: "Message is not found.",
      });
    }
    if (message.senderId !== currentUser.id) {
      return res.status(401).json({
        message: "Deleting others's message is forbidden.",
      });
    }
    await prisma.message.delete({
      where: {
        id: parseInt(messageId),
        senderId: currentUser.id,
      },
    });
    return res.json({
      message: "Message is deleted successfully.",
    });
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
    const message = await prisma.message.findUnique({
      where: {
        id: parseInt(messageId),
      },
    });
    if (!message) {
      return res.status(404).json({
        message: "Message is not found.",
      });
    }
    if (message.senderId !== currentUser.id) {
      return res.status(401).json({
        message: "Editing others's message is forbidden.",
      });
    }
    const updatedMessage = await prisma.message.update({
      where: {
        id: parseInt(messageId),
      },
      data: {
        edit: true,
        content,
        mimeType,
        fileURL,
        type,
      },
    });
    return res.json({
      message: "Message is updated sucessfully.",
      updatedMessage: updatedMessage,
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
