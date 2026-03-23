import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socketIo/server.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js"; // ✅ was missing

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  if (!message) {
    return next(new AppError("Message cannot be empty", 400)); // ✅ use next()
  }

  let conversation = await Conversation.findOne({
    members: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      members: [senderId, receiverId],
    });
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    conversationId: conversation._id, // ✅ was missing
    message,
  });

  conversation.messages.push(newMessage._id);
  await conversation.save();

  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: newMessage,
  });
});

export const getMessage = asyncHandler(async (req, res) => {
  const { id: chatUserId } = req.params;
  const senderId = req.user._id;

  // 🔥 Get page & limit from query
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const skip = (page - 1) * limit;

  // 🔥 Fetch messages between two users
  const messages = await Message.find({
    $or: [
      { senderId: senderId, receiverId: chatUserId },
      { senderId: chatUserId, receiverId: senderId },
    ],
  })
    .sort({ createdAt: -1 }) // latest first
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: messages.length,
    data: messages,
  });
});
