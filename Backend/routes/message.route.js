import express from "express";
import { getMessage, sendMessage } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";
import { messageLimiter } from "../middleware/rateLimiter.js";
import { uploadMessageFile } from "../middleware/multer.js";

const router = express.Router();

// ✅ uploadMessageFile.single("file") runs before sendMessage
// If no file is attached the field is just undefined — text-only still works
router.post(
  "/send/:id",
  secureRoute,
  messageLimiter,
  uploadMessageFile.single("file"),
  sendMessage,
);

router.get("/:id", secureRoute, getMessage);

export default router;
