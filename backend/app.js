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

const connectedUsers = {};
io.on("connection", async (socket) => {
  socket.on("user connected", (userId) => {
    connectedUsers[userId] = socket.id;

    io.emit("user connected", Object.keys(connectedUsers));
  });
  socket.on("disconnect", async () => {
    const userId = socket.handshake.auth.userId;
    if (!userId) return;
    delete connectedUsers[userId];
    console.log(socket.handshake);
    await prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        lastSeen: new Date(),
      },
    });
    io.emit("user disconnected", userId);
    console.log("user diconnected.");
  });
  console.log("user connected.");
  socket.on("join chat", async (conversationId) => {
    const convId = String(conversationId);

    socket.join(convId);
    try {
      const userId = socket.handshake.auth.userId;
      const userPreferences = await prisma.preferences.findUnique({
        where: { userId: userId },
      });

      if (!socket.recovered && convId) {
        const missedMessages = await prisma.message.findMany({
          where: {
            conversationId: parseInt(convId),
            id: {
              gt: socket.handshake.auth.serverOffset || 0,
            },
          },
          include: {
            sender: {
              include: {
                profile: true,
              },
            },
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
          socket
            .timeout(5000)
            .emit("chat message", filtered, convId, message.id);
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
            ...message,
            clientOffset: clientOffset,
          },
          include: {
            sender: {
              include: {
                profile: true,
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
      }
      socket.broadcast
        .to(convId)
        .timeout(5000)
        .emit(
          "chat message",
          createdMessage,
          convId,
          createdMessage.id,
          (response, err) => {
            if (err) {
              console.error("socket error:", err);
              return;
            }
          },
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
});
console.log(process.env.clientURL);

app.use(
  cors({
    origin: process.env.clientURL,
    methods: ["POST", "PUT", "OPTIONS", "PATCH", "GET", "DELETE"],
  }),
);
app.options("/*", cors());

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
