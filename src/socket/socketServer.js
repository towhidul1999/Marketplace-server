const http = require("http");
const socketIo = require("socket.io");
const logger = require("../config/logger");
const user = require("./events/user");
const express = require("express");
const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
  allowEIO3: true,
  perMessageDeflate: false,
});

const PORT = 8081;

// Configure Socket.IO events and handlers here
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  user(socket);
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
  socket.on("typing", function (data) {
    socket.broadcast.to(socket.roomId).emit("startedTyping", data);
  });
  socket.on("typingStopped", function (data) {
    socket.broadcast.to(socket.roomId).emit("stoppedTyping", data);
  });
  socket.on("disconnect", () => {
    console.log(`ID: ${socket.id} disconnected`);
  });
});

// Start the Socket.IO server
server.listen(PORT, () => {
  logger.info(`Socket server is running on port ${PORT}`);
});

const initSocket = () => {
  logger.info("Socket server initialized");
};

module.exports = { initSocket, io };
