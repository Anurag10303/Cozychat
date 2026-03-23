import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import AppError from "../utils/AppError.js";

const app = express();
const server = http.createServer(app);

// 🔥 userId -> Set of socketIds
const users = {};

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://cozychat1.onrender.com"],
    credentials: true,
  },
});

// 🔥 Get all online users
export const getOnlineUsers = () => Object.keys(users);

// 🔥 Get receiver sockets
export const getReceiverSocketId = (receiverId) => {
  return users[receiverId] ? Array.from(users[receiverId]) : [];
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let userId;

  // 🔥 AUTHENTICATION
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

  // 🔥 ADD USER
  if (!users[userId]) {
    users[userId] = new Set();
  }

  users[userId].add(socket.id);

  console.log("Connected users:", users);

  // 🔥 EMIT ONLINE USERS
  io.emit("getOnlineUsers", getOnlineUsers());

  // 🔥 DISCONNECT
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    if (users[userId]) {
      users[userId].delete(socket.id);

      // 🔥 If no active sockets → user offline
      if (users[userId].size === 0) {
        delete users[userId];

        // 🔥 Update last seen in DB
        try {
          await User.findByIdAndUpdate(userId, {
            lastSeen: new Date(),
          });
        } catch (err) {
          console.log("Error updating lastSeen:", err.message);
        }
      }
    }
    io.emit("getOnlineUsers", getOnlineUsers());
  });
  socket.on("markSeen", async (messageId) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      // ✅ use userId from socket auth, not req
      if (message.receiverId.toString() !== userId.toString()) {
        throw new AppError("Not authorized", 403);
      }

      message.status = "seen";
      await message.save();

      const senderSockets = getReceiverSocketId(message.senderId);
      senderSockets.forEach((id) => {
        io.to(id).emit("messageSeen", messageId);
      });
    } catch (err) {
      console.log("Error marking seen:", err.message);
    }
  });
  socket.on("typing", ({ receiverId }) => {
    const receiverSockets = getReceiverSocketId(receiverId);

    receiverSockets.forEach((id) => {
      io.to(id).emit("typing", {
        senderId: userId,
      });
    });
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSockets = getReceiverSocketId(receiverId);

    receiverSockets.forEach((id) => {
      io.to(id).emit("stopTyping", {
        senderId: userId,
      });
    });
  });
});

export { app, io, server };
