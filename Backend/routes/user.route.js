import express from "express";
import { uploadAvatar } from "../middleware/multer.js";
import {
  allUsers,
  signIn,
  signOut,
  signUp,
} from "../controller/user.controller.js";
import secureRoute from "../middleware/secureRoute.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post(
  "/signup",
  authLimiter,
  uploadAvatar.single("avatar"), // ✅ DIRECT USE
  signUp,
);
router.post("/login", authLimiter, signIn);
router.post("/logout", signOut);
router.get("/users", secureRoute, allUsers);

export default router;
