import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);

// Store users → userId -> Set of socketIds
const users = {};

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://cozychat1.onrender.com"],
    credentials: true,
  },
});

// 🔥 Get all socketIds of a user
export const getReceiverSocketId = (receiverId) => {
  return users[receiverId] ? Array.from(users[receiverId]) : [];
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔥 Step 1: Authenticate user (using JWT)
  let userId;

  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;

  } catch (error) {
    console.log("Socket auth failed:", error.message);
    socket.disconnect();
    return;
  }

  // 🔥 Step 2: Store user socket
  if (!users[userId]) {
    users[userId] = new Set();
  }

  users[userId].add(socket.id);

  console.log("Connected users:", users);

  // 🔥 Step 3: Emit online users list
  io.emit("getOnlineUsers", Object.keys(users));

  // 🔥 Step 4: Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (users[userId]) {
      users[userId].delete(socket.id);

      if (users[userId].size === 0) {
        delete users[userId];
      }
    }

    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };