import express from "express";
import { getMessage, sendMessage } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";
import { messageLimiter } from "../middleware/rateLimiter.js";
const router = express.Router();
router.post("/send/:id", secureRoute, messageLimiter, sendMessage);
router.get("/:id", secureRoute, getMessage);
export default router;
