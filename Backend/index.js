import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socketIo/server.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();
const Port = process.env.PORT || 4000;
const URI = process.env.MONGODB_URL;

app.use(express.json());
app.use(cookieParser());

// allow both deployed and local frontend
const allowedOrigins = [
  "http://localhost:5173", // for local frontend
  "https://chat-application-j0m9.onrender.com", // for deployed frontend
];

app.use(
  cors({
    origin: ["http://localhost:5173", "https://chat-application-j0m9.onrender.com"],
    // origin: "http://localhost:5173", // Match frontend origin
    credentials: true, // Allow cookies
    exposedHeaders: ["Set-Cookie", "Authorization"],
  })
);

app.use("/user", userRoute);
app.use("/user/message", messageRoute);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------deployment----
if (process.env.NODE_ENV === "production") {
  const dirPath = path.resolve();
  app.use(express.static(path.join(dirPath, "Frontend", "dist")));

  app.get("/*splat", (req, res) => {
    res.sendFile(path.resolve(dirPath, "Frontend", "dist", "index.html"));
  });
}

try {
  mongoose
    .connect(URI)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log("MongoDB connection error:", error));
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}

server.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
