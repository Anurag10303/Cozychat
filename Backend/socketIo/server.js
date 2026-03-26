import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import AppError from "../utils/AppError.js";

const app = express();
const server = http.createServer(app);

// userId -> Set of socketIds
const users = {};

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://cozychat1.onrender.com"],
    credentials: true,
  },
});

export const getOnlineUsers = () => Object.keys(users);

export const getReceiverSocketId = (receiverId) => {
  return users[receiverId] ? Array.from(users[receiverId]) : [];
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let userId;

  // ✅ AUTHENTICATION
  try {
    const token = socket.handshake.auth.token;
    if (!token) throw new Error("No token provided");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    console.log("Socket auth failed:", error.message);
    socket.disconnect();
    return;
  }

  // ✅ ADD USER
  if (!users[userId]) users[userId] = new Set();
  users[userId].add(socket.id);

  io.emit("getOnlineUsers", getOnlineUsers());

  // ✅ On connect — mark all undelivered messages sent TO this user as "delivered"
  // and notify each sender so their tick updates to double grey
  (async () => {
    try {
      const undelivered = await Message.find({
        receiverId: userId,
        status: "sent",
      });

      if (undelivered.length === 0) return;

      // Bulk update in DB
      const messageIds = undelivered.map((m) => m._id);
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { status: "delivered" } },
      );

      // Notify each sender — group by senderId to reduce socket calls
      const bySender = {};
      undelivered.forEach((msg) => {
        const sid = msg.senderId.toString();
        if (!bySender[sid]) bySender[sid] = [];
        bySender[sid].push(msg._id.toString());
      });

      Object.entries(bySender).forEach(([senderId, ids]) => {
        const senderSockets = getReceiverSocketId(senderId);
        ids.forEach((messageId) => {
          senderSockets.forEach((socketId) => {
            // ✅ Emit correct shape: { messageId, status }
            io.to(socketId).emit("messageStatusUpdate", {
              messageId,
              status: "delivered",
            });
          });
        });
      });
    } catch (err) {
      console.log("Error marking delivered on connect:", err.message);
    }
  })();

  // ✅ markSeen — mark ALL unseen messages in a conversation as seen at once
  // Frontend should emit this when user opens/views a conversation
  socket.on("markSeen", async ({ conversationId, senderId }) => {
    try {
      if (!conversationId || !senderId) return;

      // Find all unseen messages sent by the other user in this conversation
      const unseenMessages = await Message.find({
        conversationId,
        senderId,
        receiverId: userId,
        status: { $ne: "seen" },
      });

      if (unseenMessages.length === 0) return;

      const messageIds = unseenMessages.map((m) => m._id);

      // Bulk update
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { status: "seen" } },
      );

      // Notify sender for each message — their tick turns blue
      const senderSockets = getReceiverSocketId(senderId);
      unseenMessages.forEach((msg) => {
        senderSockets.forEach((socketId) => {
          // ✅ Emit correct shape: { messageId, status }
          io.to(socketId).emit("messageStatusUpdate", {
            messageId: msg._id.toString(),
            status: "seen",
          });
        });
      });
    } catch (err) {
      console.log("Error marking seen:", err.message);
    }
  });

  // ✅ TYPING
  socket.on("typing", ({ receiverId }) => {
    const receiverSockets = getReceiverSocketId(receiverId);
    receiverSockets.forEach((id) => {
      io.to(id).emit("typing", { senderId: userId });
    });
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSockets = getReceiverSocketId(receiverId);
    receiverSockets.forEach((id) => {
      io.to(id).emit("stopTyping", { senderId: userId });
    });
  });

  // ✅ DISCONNECT
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    if (users[userId]) {
      users[userId].delete(socket.id);

      if (users[userId].size === 0) {
        delete users[userId];
        try {
          await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
        } catch (err) {
          console.log("Error updating lastSeen:", err.message);
        }
      }
    }

    io.emit("getOnlineUsers", getOnlineUsers());
  });
});

export { app, io, server };
