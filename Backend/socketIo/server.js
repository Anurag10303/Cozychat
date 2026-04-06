import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import redisClient from "../utils/redisClient.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const app = express();
const server = http.createServer(app);

// ─── Redis Helpers ───────────────────────────────────────────

export const addUserSocket = async (userId, socketId) => {
  await redisClient.sAdd(`user:sockets:${userId}`, socketId);
  await redisClient.sAdd("online:users", String(userId));
};

export const removeUserSocket = async (userId, socketId) => {
  await redisClient.sRem(`user:sockets:${userId}`, socketId);
  const remaining = await redisClient.sCard(`user:sockets:${userId}`);
  if (remaining === 0) {
    await redisClient.sRem("online:users", String(userId));
    await redisClient.del(`user:sockets:${userId}`);
    return true;
  }
  return false;
};

export const getReceiverSocketId = async (userId) => {
  return await redisClient.sMembers(`user:sockets:${userId}`);
};

export const getOnlineUsers = async () => {
  return await redisClient.sMembers("online:users");
};

// ─── Socket.IO Server ────────────────────────────────────────

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://cozychat1.onrender.com"],
    credentials: true,
  },
});

// ─── Redis Adapter for pub/sub (Upstash TLS) ─────────────────

// ✅ Both pub and sub clients need TLS for Upstash
const pubClient = createClient({
  url: process.env.REDIS_URL, // must start with rediss:// not redis://
  socket: {
    tls: true, // ✅ required for Upstash
    rejectUnauthorized: false, // ✅ Upstash free tier uses self-signed cert
    reconnectStrategy: (retries) => {
      if (retries > 5) return false; // stop retrying instead of crashing
      return Math.min(retries * 100, 3000);
    },
  },
});

const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.log("Redis pub error:", err.message));
subClient.on("error", (err) => console.log("Redis sub error:", err.message));

// ✅ Redis adapter is optional — app runs fine without it
(async () => {
  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Redis adapter connected");
  } catch (err) {
    console.log("Redis adapter failed, running without it:", err.message);
  }
})();

// ─── Socket Connection ───────────────────────────────────────

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  let userId;

  // ── Auth ──────────────────────────────────────────────────
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

  // ── Clean stale sockets ───────────────────────────────────
  try {
    const existingSockets = await redisClient.sMembers(
      `user:sockets:${userId}`,
    );
    for (const staleSocketId of existingSockets) {
      const activeSocket = io.sockets.sockets.get(staleSocketId);
      if (!activeSocket) {
        await redisClient.sRem(`user:sockets:${userId}`, staleSocketId);
      }
    }
  } catch (err) {
    console.log("Error cleaning stale sockets:", err.message);
  }

  // ── Register user ─────────────────────────────────────────
  await addUserSocket(userId, socket.id);
  const onlineUsers = await getOnlineUsers();
  io.emit("getOnlineUsers", onlineUsers);

  // ── Mark undelivered messages as delivered ────────────────
  try {
    const undelivered = await Message.find({
      receiverId: userId,
      status: "sent",
    });

    if (undelivered.length > 0) {
      const messageIds = undelivered.map((m) => m._id);

      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { status: "delivered" } },
      );

      const bySender = {};
      undelivered.forEach((msg) => {
        const sid = msg.senderId.toString();
        if (!bySender[sid]) bySender[sid] = [];
        bySender[sid].push(msg._id.toString());
      });

      for (const [senderId, ids] of Object.entries(bySender)) {
        const senderSockets = await getReceiverSocketId(senderId);
        ids.forEach((messageId) => {
          senderSockets.forEach((socketId) => {
            io.to(socketId).emit("messageStatusUpdate", {
              messageId,
              status: "delivered",
            });
          });
        });
      }
    }
  } catch (err) {
    console.log("Error marking delivered:", err.message);
  }

  // ── markSeen ──────────────────────────────────────────────
  socket.on("markSeen", async ({ senderId }) => {
    try {
      if (!senderId) return;

      const unseenMessages = await Message.find({
        senderId,
        receiverId: userId,
        status: { $in: ["sent", "delivered"] },
      });

      if (unseenMessages.length === 0) return;

      const messageIds = unseenMessages.map((m) => m._id);

      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { status: "seen" } },
      );

      const senderSockets = await getReceiverSocketId(senderId);
      unseenMessages.forEach((msg) => {
        senderSockets.forEach((socketId) => {
          io.to(socketId).emit("messageStatusUpdate", {
            messageId: msg._id.toString(),
            status: "seen",
          });
        });
      });
    } catch (err) {
      console.log("Error in markSeen:", err.message);
    }
  });

  // ── Typing ────────────────────────────────────────────────
  socket.on("typing", async ({ receiverId }) => {
    const receiverSockets = await getReceiverSocketId(receiverId);
    receiverSockets.forEach((id) => {
      io.to(id).emit("typing", { senderId: userId });
    });
  });

  socket.on("stopTyping", async ({ receiverId }) => {
    const receiverSockets = await getReceiverSocketId(receiverId);
    receiverSockets.forEach((id) => {
      io.to(id).emit("stopTyping", { senderId: userId });
    });
  });

  // ── Disconnect ────────────────────────────────────────────
  socket.on("disconnect", async () => {
    if (!userId) return;
    console.log("User disconnected:", socket.id);

    try {
      await removeUserSocket(userId, socket.id);
    } catch (err) {
      console.log("Error on disconnect:", err.message);
    }

    const onlineUsers = await getOnlineUsers();
    io.emit("getOnlineUsers", onlineUsers);
  });
});

export { app, io, server };
