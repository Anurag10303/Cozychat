import rateLimit from "express-rate-limit";
import AppError from "../utils/AppError.js";

// General limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // max 100 requests per IP
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔥 Strict limiter for login/signup
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 attempts
  handler: (req, res, next) => {
    next(new AppError("Too many login attempts. Try again later.", 429));
  },
});

// 🔥 Message limiter (chat spam protection)
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // max 20 messages/min
  handler: (req, res, next) => {
    next(new AppError("Too many messages sent. Slow down.", 429));
  },
});