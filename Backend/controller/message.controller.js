import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socketIo/server.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";  // ✅ was missing

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  if (!message) {
    return next(new AppError("Message cannot be empty", 400));  // ✅ use next()
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
    conversationId: conversation._id,  // ✅ was missing
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
  const { id: chatUser } = req.params;
  const senderId = req.user._id;

  const conversation = await Conversation.findOne({
    members: { $all: [senderId, chatUser] },
  }).populate("messages");  // ✅ works now since model is named "Message"

  if (!conversation) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  res.status(200).json({
    success: true,
    data: conversation.messages,
  });
});