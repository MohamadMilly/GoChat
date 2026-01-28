const jwt = require("jsonwebtoken");

// import enviroment variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const bcrypt = require("bcryptjs");

const prisma = require("../lib/prisma");

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

module.exports = { sendMessagePost };
