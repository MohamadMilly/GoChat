const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
// import enviroment variables
require("dotenv").config();

const cors = require("cors");

const prisma = require("./lib/prisma");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.clientURL,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 1000 * 60 * 2,
  },
});
let connectedUsers = new Map();

io.on("connection", async (socket) => {
  const userId = socket.handshake.auth.userId;
  if (!connectedUsers[userId]) connectedUsers.set(userId, socket.id);

  socket.isFirstConnection = true;
  io.emit("user connected", [...connectedUsers.keys()]);

  socket.on("disconnect", async () => {
    const userId = socket.handshake.auth.userId;
    if (!userId) return;
    connectedUsers.delete(userId);
    await prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        lastSeen: new Date(),
      },
    });
    io.emit("user disconnected", userId);
  });

  socket.on("join chat", async (conversationId) => {
    if (!conversationId) return;
    const convId = String(conversationId);

    socket.join(convId);
    try {
      const userId = socket.handshake.auth.userId;
      if (!userId) return;
      const userPreferences = await prisma.preferences.findUnique({
        where: { userId: userId },
      });

      if (
        !socket.recovered &&
        convId &&
        !socket.handshake.auth.isInitialDataLoading
      ) {
        const missedMessages = await prisma.message.findMany({
          where: {
            conversationId: parseInt(convId),
            id: {
              gt: Number(socket.handshake.auth.serverOffset[convId]) || 0,
            },
          },
          include: {
            sender: {
              include: {
                profile: true,
              },
            },
            repliedMessage: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        missedMessages.forEach((message) => {
          const filtered = {
            ...message,
            sender: filterProfile(message.sender, [userPreferences]),
          };
          socket.emit("chat message", filtered, convId, message.id);
        });
        socket.recovered = true;
      }
    } catch (err) {
      console.error("recovery error:", err);
    }
  });
  socket.on(
    "chat message",

    async (message, conversationId, clientOffset) => {
      const convId = String(conversationId);
      const userId = socket.handshake.auth.userId;

      const userPreferences = await prisma.preferences.findUnique({
        where: {
          userId: userId,
        },
      });
      let createdMessage;
      try {
        const permissions = await prisma.permissions.findUnique({
          where: {
            conversationId: parseInt(conversationId),
          },
        });
        const admin = await prisma.conversationAdmin.findUnique({
          where: {
            conversationId_userId: {
              conversationId: parseInt(conversationId),
              userId: parseInt(userId),
            },
          },
        });
        if (!permissions?.sendingMessages && !admin) {
          throw new Error(
            "Sending messages is not allowed due to permissions restrictions.",
          );
        }
        if (
          !permissions.sendingMedia &&
          !admin &&
          !message.mimeType.includes("text") &&
          !(message.type === "TEXT")
        ) {
          throw new Error(
            "Sending media messages is not allowed due to permissions restrictions.",
          );
        }
        createdMessage = await prisma.message.create({
          data: {
            sender: {
              connect: {
                id: userId,
              },
            },
            conversation: {
              connect: {
                id: parseInt(convId),
              },
            },
            content: message.content,
            fileURL: message.fileURL,
            mimeType: message.mimeType,
            type: message.type,
            clientOffset: clientOffset,
            repliedMessage: message.repliedMessageId
              ? {
                  connect: {
                    id: message.repliedMessageId,
                  },
                }
              : undefined,
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
          },
        });

        createdMessage = {
          ...createdMessage,
          sender: filterProfile(createdMessage.sender, [userPreferences]),
        };
        await prisma.conversation.update({
          where: { id: parseInt(convId, 10) },
          data: { updatedAt: new Date() },
        });
      } catch (err) {
        console.error("socket error: ", err);
        if (err.code === "P2002") {
        }
        return;
      }

      io.to(convId).emit(
        "chat message",
        createdMessage,
        convId,
        createdMessage.id,
        message.createdAt,
      );
    },
  );

  socket.on("typing", (conversationId) => {
    const userId = socket.handshake.auth.userId;
    const convId = String(conversationId);
    socket.broadcast.to(convId).emit("typing", userId, convId);
  });
  socket.on("stopped typing", (conversationId) => {
    const userId = socket.handshake.auth.userId;
    socket.broadcast.to(String(conversationId)).emit("stopped typing", userId);
  });

  socket.on("read message", async (messageId, readerId, callback) => {
    if (!messageId || !readerId) return;
    try {
      const messageOnReader = await prisma.messageOnReader.findUnique({
        where: {
          messageId_readerId: {
            messageId: parseInt(messageId),
            readerId: parseInt(readerId),
          },
        },
      });
      if (messageOnReader) {
        callback({
          status: 401,
        });
        return;
      }
      await prisma.messageOnReader.upsert({
        where: {
          messageId_readerId: {
            messageId: parseInt(messageId),
            readerId: parseInt(readerId),
          },
        },
        create: {
          message: {
            connect: {
              id: parseInt(messageId),
            },
          },
          reader: {
            connect: {
              id: parseInt(readerId),
            },
          },
        },
        update: {},
      });
      io.emit("read message", messageId, readerId);
      callback({
        status: "ok",
      });
    } catch (err) {
      callback({
        status: 500,
      });
    }
  });

  socket.on("delete message", async (messageId, conversationId, callback) => {
    const userId = socket.handshake.auth.userId;
    try {
      const message = await prisma.message.findUnique({
        where: {
          id: messageId,
        },
      });
      if (!message) {
        callback({
          status: 404,
        });
        return;
      }
      if (message.senderId !== userId) {
        callback({
          status: 401,
        });
        return;
      }
      const deletedReadersPromise = prisma.messageOnReader.deleteMany({
        where: {
          messageId: messageId,
        },
      });
      const deletedMessagePromise = prisma.message.delete({
        where: {
          id: messageId,
          senderId: userId,
        },
      });
      await prisma.$transaction([deletedReadersPromise, deletedMessagePromise]);
      callback({
        status: "ok",
      });
      io.emit("delete message", messageId, conversationId);
    } catch (err) {
      callback({
        status: 500,
      });
    }
  });
  socket.on("edit message", async (message, conversationId, callback) => {
    if (!message || !conversationId) return;
    const userId = socket.handshake.auth.userId;
    try {
      const dbMessage = await prisma.message.findUnique({
        where: {
          id: message.id,
        },
      });
      if (!message) {
        callback({
          status: 404,
        });
        return;
      }
      if (userId !== dbMessage.senderId) {
        callback({
          status: 401,
        });
      }

      const updatedMessage = await prisma.message.update({
        where: {
          id: message.id,
        },
        data: {
          content: message.content,
          mimeType: message.mimeType,
          type: message.type,
          fileURL: message?.fileURL || "",
          edit: true,
        },
        include: {
          sender: true,
        },
      });
      callback({
        status: "ok",
      });

      socket.broadcast
        .to(conversationId)
        .emit("edit message", updatedMessage, conversationId);
    } catch (err) {
      callback({
        status: 500,
      });
    }
  });
});

app.use(
  cors({
    origin: process.env.clientURL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "authorization"],
  }),
);

// routers
const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const conversationsRouter = require("./routes/conversationsRouter");
const filterProfile = require("./utils/filterProfile");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  }),
);

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/conversations", conversationsRouter);

const PORT = process.env.PORT || 3000;

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log("Server is listening on port: ", PORT);
});
