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
  "https://cozychat1.onrender.com", // for deployed frontend
];

app.use(
  cors({
    origin: ["http://localhost:5173", "https://cozychat1.onrender.com"],
    // origin: "http://localhost:5173", // Match frontend origin
    credentials: true, // Allow cookies
    exposedHeaders: ["Set-Cookie", "Authorization"],
  }),
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

// ✅ Root test route (for development and backend testing)
app.get("/", (req, res) => {
  res.send("✅ CozyChat backend is live and working!");
});

mongoose
  .connect(URI)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(Port, () => {
      console.log(`Server running on port ${Port}`);
    });
    console.log("Connected DB:", mongoose.connection.name);
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
