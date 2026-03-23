import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socketIo/server.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js"; // ✅ was missing

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { message, clientMessageId } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  if (!message) {
    return next(new AppError("Message cannot be empty", 400));
  }

  if (!clientMessageId) {
    return next(new AppError("clientMessageId is required", 400));
  }

  // 🔥 Check duplicate (logic level)
  const existingMessage = await Message.findOne({ clientMessageId });

  if (existingMessage) {
    return res.status(200).json({
      success: true,
      message: "Duplicate prevented",
      data: existingMessage,
    });
  }

  let conversation = await Conversation.findOne({
    members: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      members: [senderId, receiverId],
    });
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    message,
    clientMessageId,
    status: "sent",
  });

  // 🔥 ALWAYS save message first
  try {
    await newMessage.save();
  } catch (err) {
    if (err.code === 11000) {
      const existing = await Message.findOne({ clientMessageId });
      return res.status(200).json({
        success: true,
        message: "Duplicate prevented (DB)",
        data: existing,
      });
    }
    throw err;
  }

  // 🔥 Now push to conversation
  if (!conversation.messages) {
    conversation.messages = [];
  }

  conversation.messages.push(newMessage._id);
  await conversation.save();

  // 🔥 Socket delivery
  const receiverSocketIds = getReceiverSocketId(receiverId);

  if (receiverSocketIds.length > 0) {
    await Message.findByIdAndUpdate(newMessage._id, {
      status: "delivered",
    });

    receiverSocketIds.forEach((id) => {
      io.to(id).emit("newMessage", newMessage);
    });
  }

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: newMessage,
  });
});

export const getMessage = asyncHandler(async (req, res, next) => {
  const { id: chatUserId } = req.params;
  const senderId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {
    $or: [
      { senderId: senderId, receiverId: chatUserId },
      { senderId: chatUserId, receiverId: senderId },
    ],
  };

  // 🔥 Run both queries in parallel for better performance
  const [messages, total] = await Promise.all([
    Message.find(query)
      .sort({ createdAt: -1, _id: -1 }) // 🔥 FIXED
      .skip(skip)
      .limit(limit),
    Message.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    page,
    limit,
    total, // total messages count
    totalPages: Math.ceil(total / limit), // total pages
    hasNextPage: page < Math.ceil(total / limit), // is there a next page?
    count: messages.length, // messages in current page
    data: messages,
  });
});
