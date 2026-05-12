const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

// routers
const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const conversationsRouter = require("./routes/conversationsRouter");
const filterProfile = require("./utils/filterProfile");

const {
  handleConnection,
  handleDiconnection,
  getConnectedUsersIds,
  handleDisconnection,
} = require("./utils/connectionUtils");
// import enviroment variables
require("dotenv").config();

const cors = require("cors");

const prisma = require("./lib/prisma");

// listeners
const disconnect = require("./realtime/listeners/disconnect");
const joinConversation = require("./realtime/listeners/joinConversation");
const recover = require("./realtime/listeners/recover");
const processChatMessage = require("./realtime/listeners/chatMessage");
const publishTyping = require("./realtime/listeners/typing");
const stoppedTyping = require("./realtime/listeners/stoppedTyping");
const readMessage = require("./realtime/listeners/readMessage");
const deleteMessage = require("./realtime/listeners/deleteMessage");
const editMessage = require("./realtime/listeners/editMessage");
const blockUser = require("./realtime/listeners/blockUser");
const unblockUser = require("./realtime/listeners/unblockUser");
const editPermissions = require("./realtime/listeners/editPermissions");
const joinConversationBroadcast = require("./realtime/listeners/joinConversationBroadcast");
const leaveConversation = require("./realtime/listeners/leaveConversation");
const createConversation = require("./realtime/listeners/createConversation");
const editConversation = require("./realtime/listeners/editConversation");
const reactToMessage = require("./realtime/listeners/reaction");

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

io.on("connection", async (socket) => {
  const userId = socket.handshake.auth.userId;
  const hasConnected = handleConnection(userId);

  // sending all previous connected users to the new client
  socket.emit("connected users", getConnectedUsersIds());
  if (hasConnected) {
    socket.broadcast.emit("user connected", userId);
  }

  socket.on("disconnect", () => disconnect(socket, io));

  socket.on("join chat", (conversationId) =>
    joinConversation(socket, io, conversationId),
  );

  socket.on("recover", (offsets) => recover(socket, io, offsets));
  socket.on("chat message", (...data) =>
    processChatMessage(socket, io, ...data),
  );

  socket.on("typing", (conversationId) =>
    publishTyping(socket, io, conversationId),
  );

  socket.on("stopped typing", (conversationId) =>
    stoppedTyping(socket, io, conversationId),
  );

  socket.on("read message", (conversationId, messageId, readerId, callback) =>
    readMessage(socket, io, conversationId, messageId, readerId, callback),
  );

  socket.on("delete message", (messageId, conversationId, callback) =>
    deleteMessage(socket, io, messageId, conversationId, callback),
  );
  socket.on("edit message", (message, conversationId, callback) =>
    editMessage(socket, io, message, conversationId, callback),
  );

  socket.on("block user", (userId, conversationId) =>
    blockUser(socket, io, userId, conversationId),
  );
  socket.on("unblock user", (userId, conversationId) =>
    unblockUser(socket, io, userId, conversationId),
  );
  socket.on("edit permissions", (conversationId) =>
    editPermissions(socket, io, conversationId),
  );

  socket.on("join conversation", (conversationId, fullname) =>
    joinConversationBroadcast(socket, io, conversationId, fullname),
  );
  socket.on(
    "leave conversation",
    (withDelete, fullname, userId, conversationId) =>
      leaveConversation(
        socket,
        io,
        withDelete,
        fullname,
        userId,
        conversationId,
      ),
  );
  socket.on("create conversation", (participantsIds) =>
    createConversation(socket, io, participantsIds),
  );

  socket.on(
    "edit conversation",
    (participantsIds, prevParticipantsIds, conversationId, callback) =>
      editConversation(
        socket,
        io,
        participantsIds,
        prevParticipantsIds,
        conversationId,
        callback,
      ),
  );

  socket.on("reaction", (messageId, userId, conversationId, type, callback) =>
    reactToMessage(
      socket,
      io,
      messageId,
      userId,
      Number(conversationId),
      type,
      callback,
    ),
  );
});

app.use(
  cors({
    origin: process.env.clientURL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "authorization"],
  }),
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  }),
);

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/conversations", conversationsRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Route does not exist.",
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log("Server is listening on port: ", PORT);
});
