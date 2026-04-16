import multer from "multer";
import dotenv from "dotenv";
dotenv.config();
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import AppError from "../utils/AppError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Avatar upload (Cloudinary storage) ──────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cozychat/avatars",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 200, height: 200, crop: "fill", gravity: "face" },
    ],
  },
});

const avatarFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.mimetype))
    return cb(new AppError("Only image files are allowed", 400), false);
  cb(null, true);
};

const messageFileFilter = (req, file, cb) => {
  const allowed = [
    // images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    // video
    "video/mp4",
    "video/quicktime",
    "video/webm",
    // audio
    "audio/mpeg",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    // documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowed.includes(file.mimetype))
    return cb(new AppError("File type not supported", 400), false);

  cb(null, true);
};

// ── Avatar upload instance ───────────────────────────────────
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: avatarFileFilter,
});

// ── Message file upload — memoryStorage ─────────────────────
// Files are uploaded to Cloudinary manually in message.controller.js
// using upload_stream with type: "upload" to guarantee public URLs.
// This avoids multer-storage-cloudinary defaulting to "authenticated"
// for raw (document) resources which causes 401 errors on download.
export const uploadMessageFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video/audio
  fileFilter: messageFileFilter,
});

// keep default export for avatar (backwards compat with existing routes)
export default uploadAvatar;
