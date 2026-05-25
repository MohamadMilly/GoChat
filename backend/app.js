const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

// routers
const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const conversationsRouter = require("./routes/conversationsRouter");

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

const setUpSocketsEvents = require("./realtime/setUpSockets");

const HttpError = require("./shared/errors/HttpError");
const recover = require("./realtime/listeners/user/recover");

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
  setUpSocketsEvents(socket, io);
  const userOffsets = socket.handshake.auth.serverOffset;
  console.log(userOffsets);
  if (socket.recovered) {
    console.log("✅ Handled by native Socket.io recovery engine.");
  } else if (userOffsets && Object.keys(userOffsets).length > 0) {
    console.log("🔄 Running manual DB recovery for offsets...");
    recover(socket, io, userOffsets);
  } else {
    console.log("⚠️ No offsets found. Recovery skipped.");
  }
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

app.use((req, res, next) => {
  next(new HttpError("This route does not exist", 404));
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message,
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log("Server is listening on port: ", PORT);
});
