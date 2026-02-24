import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import express from "express";
import { fileURLToPath } from "url";

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socketIo/server.js";

dotenv.config();

const Port = process.env.PORT || 4000;
const URI = process.env.MONGODB_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://cozychat1.onrender.com"],
    credentials: true,
  }),
);

app.use("/user", userRoute);
app.use("/user/message", messageRoute);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== PRODUCTION FRONTEND SERVING =====
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "..", "Frontend", "dist");

  app.use(express.static(frontendPath));

  app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Root test route
app.get("/api-test", (req, res) => {
  res.send("Backend running");
});

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
