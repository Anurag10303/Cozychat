import express from "express";
import { uploadAvatar } from "../middleware/multer.js";
import {
  allUsers,
  signIn,
  signOut,
  signUp,
  upsertPublicKey,
  getPublicKey,
  saveKeyBackup,
  getKeyBackup,
} from "../controller/user.controller.js";
import secureRoute from "../middleware/secureRoute.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// ── Auth ──────────────────────────────────────────────────────
router.post("/signup", authLimiter, uploadAvatar.single("avatar"), signUp);
router.post("/login", authLimiter, signIn);
router.post("/logout", signOut);

// ── Users ─────────────────────────────────────────────────────
router.get("/users", secureRoute, allUsers);

// ── E2EE public key exchange ──────────────────────────────────
// POST /user/public-key         — store/update caller's public key
// GET  /user/public-key/:userId — fetch another user's public key
router.post("/public-key", secureRoute, upsertPublicKey);
router.get("/public-key/:userId", secureRoute, getPublicKey);

// ── E2EE private key backup ───────────────────────────────────
// POST /user/key-backup — store caller's password-wrapped private key blob
// GET  /user/key-backup — retrieve caller's wrapped private key blob
router.post("/key-backup", secureRoute, saveKeyBackup);
router.get("/key-backup", secureRoute, getKeyBackup);

export default router;
