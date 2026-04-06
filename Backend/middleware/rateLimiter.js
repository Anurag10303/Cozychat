import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import AppError from "../utils/AppError.js";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../utils/redisClient.js";

// helper
const createStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix,
  });

// General limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: createStore("rl:general:"),
});

// Auth limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: createStore("rl:auth:"),
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res, next) => {
    next(new AppError("Too many login attempts. Try again later.", 429));
  },
});

// Message limiter
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  store: createStore("rl:message:"),
  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req),
  handler: (req, res, next) => {
    next(new AppError("Too many messages sent. Slow down.", 429));
  },
});
