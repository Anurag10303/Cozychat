import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socketIo/server.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// ─────────────────────────────────────────────
// POST /api/messages/send/:id
// ─────────────────────────────────────────────
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { message, clientMessageId } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  // ── Validation ──────────────────────────────
  if (!message) {
    return next(new AppError("Message cannot be empty", 400));
  }

  if (!clientMessageId) {
    return next(new AppError("clientMessageId is required", 400));
  }

  // ── Duplicate check (logic level) ───────────
  const existingMessage = await Message.findOne({ clientMessageId }).lean();

  if (existingMessage) {
    return res.status(200).json({
      success: true,
      message: "Duplicate prevented",
      data: existingMessage,
    });
  }

  // ── Find or create conversation ─────────────
  let conversation = await Conversation.findOne({
    members: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      members: [senderId, receiverId],
    });
  }

  // ── Save message ────────────────────────────
  const newMessage = new Message({
    senderId,
    receiverId,
    message,
    clientMessageId,
    conversationId: conversation._id, 
    status: "sent",
  });

  try {
    await newMessage.save();
  } catch (err) {
    // Duplicate key at DB level (race condition fallback)
    if (err.code === 11000) {
      const existing = await Message.findOne({ clientMessageId }).lean();
      return res.status(200).json({
        success: true,
        message: "Duplicate prevented (DB)",
        data: existing,
      });
    }
    throw err;
  }

  // ── Push to conversation ────────────────────
  if (!conversation.messages) {
    conversation.messages = [];
  }

  conversation.messages.push(newMessage._id);
  await conversation.save();

  // ── Socket delivery ─────────────────────────
  const receiverSocketIds = getReceiverSocketId(receiverId);

  if (receiverSocketIds && receiverSocketIds.length > 0) {
    // FIX: use { new: true } so we emit the updated doc with status "delivered"
    const deliveredMessage = await Message.findByIdAndUpdate(
      newMessage._id,
      { status: "delivered" },
      { new: true }
    ).lean();

    receiverSocketIds.forEach((id) => {
      io.to(id).emit("newMessage", deliveredMessage);
    });

    // Return the delivered version to sender too
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: deliveredMessage,
    });
  }

  // Receiver is offline — return original saved message
  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: newMessage,
  });
});

// ─────────────────────────────────────────────
// GET /api/messages/:id?page=1&limit=20
// ─────────────────────────────────────────────
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

  // ── Parallel queries for performance ────────
  const [messages, total] = await Promise.all([
    Message.find(query)
      .sort({ createdAt: -1, _id: -1 }) // newest first for pagination
      .skip(skip)
      .limit(limit)
      .lean(), // plain JS objects — faster, no Mongoose overhead
    Message.countDocuments(query),
  ]);

  // FIX: reverse so frontend receives messages in oldest → newest order
  messages.reverse();

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    count: messages.length,
    data: messages,       // ← array, always
  });
});