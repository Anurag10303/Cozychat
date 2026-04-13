import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import express from "express";
import { fileURLToPath } from "url";

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socketIo/server.js";

import AppError from "./utils/AppError.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import redisClient from "./utils/redisClient.js";

const Port = process.env.PORT || 4000;
const URI = process.env.MONGODB_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== BASIC MIDDLEWARES =====
app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter);
app.use(
  cors({
    origin: ["http://localhost:5173", "https://cozychat1.onrender.com"],
    credentials: true,
  }),
);

// ===== ROUTES =====
app.use("/user", userRoute);
app.use("/user/messages", messageRoute);

// ✅ Keep this for backwards compatibility with old local avatars
// Safe to remove after all users re-upload or you run the migration below
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Clear all socket/online state on server restart (dev only)
if (process.env.NODE_ENV !== "production") {
  const keys = await redisClient.keys("user:sockets:*");
  if (keys.length > 0) await redisClient.del(keys);
  await redisClient.del("online:users");
  console.log("🧹 Cleared stale Redis socket state on restart");
}

// ===== PRODUCTION FRONTEND =====
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "..", "Frontend", "dist");

  app.use(express.static(frontendPath));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ===== TEST ROUTE =====
app.get("/api-test", (req, res) => {
  res.send("Backend running");
});

// ===== 404 HANDLER =====
// ✅ Fix — skip the error for /uploads/* misses, just send 404 silently
app.all("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/uploads/")) {
    return res.status(404).end();
  }
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// ===== GLOBAL ERROR HANDLER (ALWAYS LAST) =====
app.use(errorMiddleware);

// ===== DATABASE + SERVER =====
mongoose
  .connect(URI)
  .then(() => {
    console.log("MongoDB connected");
    console.log("Connected DB:", mongoose.connection.name);

    server.listen(Port, () => {
      console.log(`Server running on port ${Port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
