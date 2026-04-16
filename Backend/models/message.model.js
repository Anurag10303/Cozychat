import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    message: {
      type: String,
      default: "", // ✅ no longer required — file-only messages are valid
    },
    // ── File attachment fields ──────────────────
    fileUrl: {
      type: String,
      default: null, // full Cloudinary URL
    },
    fileType: {
      type: String,
      enum: ["image", "video", "audio", "document", null],
      default: null,
    },
    fileName: {
      type: String,
      default: null, // original filename for documents
    },
    fileMimeType: {
      type: String,
      default: null, // e.g. "video/mp4", "application/pdf"
    },
    // ───────────────────────────────────────────
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    clientMessageId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
