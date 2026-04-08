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
    /* try {
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
                profile: {
                  where: {
                    NOT: {
                      userId: {
                        in: (
                          await prisma.$queryRawUnsafe(
                            `SELECT "banningUserId" FROM "Ban" WHERE "bannedUserId" = ${userId}`,
                          )
                        ).map((banningUserObj) => banningUserObj.banningUserId),
                      },
                    },
                  },
                },
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
      */
  });
  socket.on("recover", async (offsets) => {
    const userId = socket.handshake.auth.userId;
    for (let [convId, lastId] of Object.entries(offsets)) {
      const missedMessagesInThisConversation = await prisma.message.findMany({
        where: {
          conversationId: Number(convId),
          id: {
            gt: Number(lastId) || 0,
          },
        },
        include: {
          sender: {
            include: {
              profile: {
                where: {
                  NOT: {
                    userId: {
                      in: (
                        await prisma.$queryRawUnsafe(
                          `SELECT "banningUserId" FROM "Ban" WHERE "bannedUserId" = ${userId}`,
                        )
                      ).map((banningUserObj) => banningUserObj.banningUserId),
                    },
                  },
                },
              },
            },
          },
          repliedMessage: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      for (let message of missedMessagesInThisConversation) {
        if (userId === message.senderId) continue;
        const senderPreferences = await prisma.preferences.findUnique({
          where: {
            userId: message.senderId,
          },
        });
        const filtered = {
          ...message,
          sender: filterProfile(message.sender, [senderPreferences]),
        };
        socket.emit("chat message", filtered, convId, message.id);
      }
      socket.join(convId);
    }
  });
  socket.on(
    "chat message",
    async (message, conversationId, clientOffset, callback) => {
      const convId = String(conversationId);
      const userId = socket.handshake.auth.userId;
      try {
        const conversationData = await prisma.conversation.findUnique({
          where: {
            id: parseInt(convId),
          },
          include: {
            participants: true,
          },
        });
        if (!conversationData) {
          throw new Error("conversation does not exist");
        }

        const userPreferences = await prisma.preferences.findUnique({
          where: {
            userId: userId,
          },
        });
        let createdMessage;

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
          return callback({
            status: 401,
            error:
              "Sending media messages is not allowed due to permissions restrictions.",
          });
        }

        /*
        TO DO :
        The profile i am gonna send i want to make sure that i have not banned the receiver
        so the banned-banning row between me and the receiver should be undefined to let him see my profile

        If The chat is direct i don't want even to receieve messages , and neither create them in the database
        */

        await prisma.conversation.update({
          where: { id: parseInt(convId, 10) },
          data: { updatedAt: new Date() },
        });

        const senderBannedUsers = await prisma.ban.findMany({
          where: {
            banningUserId: parseInt(userId),
          },
        });
        const senderBanningUsers = await prisma.ban.findMany({
          where: {
            bannedUserId: parseInt(userId),
          },
        });
        const senderBannedUsersIds =
          senderBannedUsers.length > 0
            ? senderBannedUsers.map(
                (senderBannedUser) => senderBannedUser.bannedUserId,
              )
            : [];

        const socketInConversations = await io.in(convId).fetchSockets();

        if (conversationData.type === "DIRECT") {
          const chatPartnerSocket = socketInConversations.find(
            (socket) => socket.handshake.auth.userId !== parseInt(userId),
          );
          const chatPartnerBanningUsers = await prisma.ban.findMany({
            where: {
              banningUserId: chatPartnerSocket
                ? chatPartnerSocket.handshake.auth.userId
                : -1,
            },
          });
          if (
            conversationData.participants.some(
              (p) =>
                senderBannedUsersIds.includes(p.userId) ||
                chatPartnerBanningUsers.find(
                  (banningUserObj) =>
                    banningUserObj.bannedUserId === parseInt(userId),
                ),
            )
          ) {
            return callback({
              status: 401,
              error:
                "one of the chat partners banned the other from sending messages",
            });
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
          io.to(convId).emit(
            "chat message",
            createdMessage,
            convId,
            createdMessage.id,
            message.createdAt, // This date for the optimistic message replacement logic
          );
          return callback({
            status: "ok",
          });
        } else if (conversationData.type === "GROUP") {
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
          socketInConversations.forEach((socket) => {
            const socketUserId = socket.handshake.auth.userId;
            if (senderBannedUsersIds.includes(Number(socketUserId))) {
              socket.emit(
                "chat message",
                {
                  ...createdMessage,
                  sender: {
                    ...createdMessage.sender,
                    profile: null,
                  },
                },
                convId,
                createdMessage.id,
                message.createdAt,
              );
            } else {
              socket.emit(
                "chat message",
                createdMessage,
                convId,
                createdMessage.id,
                message.createdAt, // This date for the optimistic message replacement logic
              );
            }
          });
          callback({
            status: "ok",
          });
        }
      } catch (err) {
        console.error("socket error: ", err);
        callback({
          status: 500,
          error: err.message,
        });
        if (err.code === "P2002") {
        }
        return;
      }
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
      const userAdminData = await prisma.conversationAdmin.findUnique({
        where: {
          conversationId_userId: {
            userId: Number(userId),
            conversationId: Number(conversationId),
          },
        },
      });

      if (message.senderId !== userId && !userAdminData) {
        return callback({
          status: 401,
        });
      }
      const deletedReadersPromise = prisma.messageOnReader.deleteMany({
        where: {
          messageId: messageId,
        },
      });
      const deletedMessagePromise = prisma.message.delete({
        where: {
          id: messageId,
          senderId: message.senderId,
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

  socket.on("block user", async (userId, conversationId) => {
    const sockets = await io.fetchSockets();
    const blockedSocket = sockets.find(
      (s) => s.handshake.auth.userId == userId,
    );

    if (blockedSocket) {
      blockedSocket.emit(
        "block user",
        socket.handshake.auth.userId,
        conversationId,
      );
    } else {
      return;
    }
  });
  socket.on("unblock user", async (userId, conversationId) => {
    const sockets = await io.fetchSockets();
    const unBlockedSocket = sockets.find(
      (s) => s.handshake.auth.userId == userId,
    );

    if (unBlockedSocket) {
      unBlockedSocket.emit(
        "unblock user",
        socket.handshake.auth.userId,
        conversationId,
      );
    } else {
      return;
    }
  });
  socket.on("edit permissions", (conversationId) => {
    if (!conversationId) {
      return;
    } else {
      io.to(conversationId).emit("edit permissions", conversationId);
    }
  });

  socket.on("join conversation", (conversationId, fullname) => {
    if (!conversationId) {
      return;
    } else {
      socket.broadcast
        .to(conversationId)
        .emit("join conversation", conversationId, fullname);
    }
  });
  socket.on(
    "leave conversation",
    (withDelete, fullname, userId, conversationId) => {
      if (!conversationId) {
        return;
      } else {
        socket.broadcast
          .to(conversationId)
          .emit(
            "leave conversation",
            withDelete,
            fullname,
            userId,
            conversationId,
          );
      }
    },
  );
  socket.on("create conversation", async (participantsIds) => {
    console.log(participantsIds);
    if (!Array.isArray(participantsIds)) return;
    /* O(n^2) i will fix it when the app gets larger */
    const participantsSockets = await io.fetchSockets();
    participantsSockets.forEach((socket) => {
      const userId = socket.handshake.auth.userId;
      if (participantsIds.includes(userId)) {
        socket.emit("create conversation");
      }
    });
  });
  socket.on(
    "edit conversation",
    async (participantsIds, conversationId, callback) => {
      try {
        const convIdInt = parseInt(conversationId);

        const conversation = await prisma.conversation.findUnique({
          where: { id: convIdInt },
          include: { participants: true },
        });

        if (!conversation) return callback({ status: 404 });

        const sockets = await io.fetchSockets();

        // 1. تحويل userId إلى Number لضمان المطابقة مع مصفوفة الأرقام
        const socketMap = new Map(
          sockets.map((s) => [Number(s.handshake.auth.userId), s]),
        );

        // 2. التأكد أن كل القيم أرقام (Numbers)
        const participantsIdsSet = new Set(participantsIds.map(Number));
        const databaseParticipantsIds = new Set(
          conversation.participants.map((p) => Number(p.userId)),
        );

        // --- إبلاغ المغادرين
        for (let pId of databaseParticipantsIds) {
          if (!participantsIdsSet.has(pId)) {
            socketMap
              .get(pId)
              ?.emit(
                "leave conversation",
                true,
                "_",
                "_",
                convIdInt.toString(),
              );
          }
        }

        // --- إبلاغ الباقين والجدد
        for (let pId of participantsIdsSet) {
          const currentSocket = socketMap.get(pId);
          if (!currentSocket) continue;

          const isNew = !databaseParticipantsIds.has(pId);
          currentSocket.emit("edit conversation", isNew, convIdInt);
        }

        callback({ status: "ok" });
      } catch (err) {
        console.error("Error in edit conversation:", err);
        callback({ status: 500 });
      }
    },
  );
});
/* 
TO DO :
Whenever someone leave a conversation i should emit the conversationId 
and the server gets this event and emits it to all connected users in this conversation 
now , if the conversation is a group => if the left member is the owner (withDelete true) or it is a direct conversation => remove the group entirely 
if not append a notification 
*/

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
