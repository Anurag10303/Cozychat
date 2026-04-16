import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socketIo/server.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import redisClient from "../utils/redisClient.js";
import { v2 as cloudinary } from "cloudinary";

// ── Detect fileType category from mimetype ───────────────────
const getFileType = (mimetype) => {
  if (!mimetype) return null;
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  return "document";
};

// ── Upload buffer to Cloudinary ──────────────────────────────
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result),
    );
    stream.end(buffer);
  });

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { message = "", clientMessageId } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  // ── Validation ───────────────────────────────────────────────
  const hasText = message.trim().length > 0;
  const hasFile = !!req.file;

  if (!hasText && !hasFile)
    return next(new AppError("Message cannot be empty", 400));
  if (!clientMessageId)
    return next(new AppError("clientMessageId is required", 400));

  // ── Duplicate check ──────────────────────────────────────────
  const existingMessage = await Message.findOne({ clientMessageId }).lean();
  if (existingMessage) {
    return res.status(200).json({
      success: true,
      message: "Duplicate prevented",
      data: existingMessage,
    });
  }

  // ── Upload file to Cloudinary via buffer (memoryStorage) ────
  let fileUrl = null;
  let fileName = null;
  let fileType = null;
  let fileMimeType = null;

  if (hasFile) {
    fileType = getFileType(req.file.mimetype);
    fileName = req.file.originalname;
    fileMimeType = req.file.mimetype;

    const folderMap = {
      image: "cozychat/messages/images",
      video: "cozychat/messages/videos",
      audio: "cozychat/messages/audio",
      document: "cozychat/messages/documents",
    };

    const resourceTypeMap = {
      image: "image",
      video: "video",
      audio: "video", // Cloudinary uses "video" resource_type for audio
      document: "raw",
    };

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: folderMap[fileType],
      resource_type: resourceTypeMap[fileType],
      type: "upload", // ← always public, no more 401
      public_id:
        fileType === "document"
          ? `${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`
          : undefined,
    });

    fileUrl = result.secure_url;
  }

  // ── Find or create conversation ──────────────────────────────
  let conversation = await Conversation.findOne({
    members: { $all: [senderId, receiverId] },
  });
  if (!conversation) {
    conversation = await Conversation.create({
      members: [senderId, receiverId],
    });
  }

  // ── Build message payload ────────────────────────────────────
  const messagePayload = {
    senderId,
    receiverId,
    message: message.trim(),
    clientMessageId,
    conversationId: conversation._id,
    status: "sent",
    fileUrl,
    fileType,
    fileName,
    fileMimeType,
  };

  // ── Save message ─────────────────────────────────────────────
  const newMessage = new Message(messagePayload);

  try {
    await newMessage.save();
  } catch (err) {
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

  conversation.messages = conversation.messages || [];
  conversation.messages.push(newMessage._id);
  await conversation.save();

  // ── Invalidate cache ─────────────────────────────────────────
  await redisClient.del(`messages:${senderId}:${receiverId}:page:1`);
  await redisClient.del(`messages:${receiverId}:${senderId}:page:1`);

  // ── Socket delivery ──────────────────────────────────────────
  const receiverSocketIds = await getReceiverSocketId(receiverId);

  if (receiverSocketIds?.length > 0) {
    const deliveredMessage = await Message.findByIdAndUpdate(
      newMessage._id,
      { status: "delivered" },
      { new: true },
    ).lean();

    receiverSocketIds.forEach((id) => {
      io.to(id).emit("newMessage", deliveredMessage);
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: deliveredMessage,
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

  const cacheKey = `messages:${senderId}:${chatUserId}:page:${page}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.status(200).json(JSON.parse(cached));

  const query = {
    $or: [
      { senderId, receiverId: chatUserId },
      { senderId: chatUserId, receiverId: senderId },
    ],
  };

  const [messages, total] = await Promise.all([
    Message.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments(query),
  ]);

  messages.reverse();

  const totalPages = Math.ceil(total / limit);
  const response = {
    success: true,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    count: messages.length,
    data: messages,
  };

  await redisClient.setEx(cacheKey, 60, JSON.stringify(response));
  res.status(200).json(response);
});
