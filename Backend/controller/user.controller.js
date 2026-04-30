import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import createTokenAndSaveCookie from "../authenticator/jwtAuth.js";

// Cloudinary gives us a full URL in req.file.path
const getAvatar = (req) => req.file?.path || null;

export const signUp = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password || !confirmPassword)
    throw new AppError("All fields are required", 400);
  if (password !== confirmPassword)
    throw new AppError("Passwords do not match", 400);

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError("User already exists", 400);

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
    avatar: getAvatar(req),
  });

  const token = createTokenAndSaveCookie(newUser._id, res);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    token,
    user: {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      avatar: newUser.avatar,
    },
  });
});

export const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new AppError("Email and password are required", 400);

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid email or password", 400);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new AppError("Invalid email or password", 400);

  const token = createTokenAndSaveCookie(user._id, res);

  res.status(200).json({
    success: true,
    message: "Sign in successful",
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
    },
  });
});

export const signOut = asyncHandler(async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
});

export const allUsers = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw new AppError("Unauthorized", 401);

  const loggedInUser = req.user._id;

  const users = await User.find({ _id: { $ne: loggedInUser } }).select(
    "-password",
  );

  const Message = (await import("../models/message.model.js")).default;

  const usersWithUnread = await Promise.all(
    users.map(async (user) => {
      const unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: loggedInUser,
        status: { $in: ["sent", "delivered"] },
      });
      return { ...user.toObject(), unreadCount };
    }),
  );

  res.status(200).json({ success: true, data: usersWithUnread });
});

// ── E2EE Public Key endpoints ─────────────────────────────────

/**
 * POST /user/public-key
 * Store (or update) the caller's ECDH public key (JWK string).
 * Called once on login after the client generates / loads its key pair.
 */
export const upsertPublicKey = asyncHandler(async (req, res) => {
  const { publicKey } = req.body;

  if (!publicKey || typeof publicKey !== "string") {
    throw new AppError("publicKey (JWK string) is required", 400);
  }

  // Basic sanity check — must be a valid JSON object with kty field
  try {
    const parsed = JSON.parse(publicKey);
    if (!parsed.kty || parsed.kty !== "EC") {
      throw new Error("Not an EC key");
    }
  } catch {
    throw new AppError("publicKey must be a valid EC JWK JSON string", 400);
  }

  await User.findByIdAndUpdate(req.user._id, { publicKey }, { new: true });

  res.status(200).json({ success: true, message: "Public key stored" });
});

/**
 * GET /user/public-key/:userId
 * Fetch another user's ECDH public key so the caller can derive a shared secret.
 * Only authenticated users can fetch keys (protects against enumeration).
 */
export const getPublicKey = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("publicKey");
  if (!user) throw new AppError("User not found", 404);

  if (!user.publicKey) {
    // User hasn't uploaded their key yet (old account or first login in progress)
    return res.status(200).json({ success: true, publicKey: null });
  }

  res.status(200).json({ success: true, publicKey: user.publicKey });
});

// ── E2EE Private Key Backup endpoints ────────────────────────

/**
 * POST /user/key-backup
 * Store the caller's AES-GCM-wrapped ECDH private key.
 *
 * The blob is opaque to the server — it is the private key encrypted with
 * a key derived from the user's password (PBKDF2). The server cannot
 * decrypt it. This allows the client to restore the private key after
 * logout or browser data loss without ever transmitting the raw key.
 *
 * Body: { encryptedPrivateKey: "<base64 string>" }
 */
export const saveKeyBackup = asyncHandler(async (req, res) => {
  const { encryptedPrivateKey } = req.body;

  if (!encryptedPrivateKey || typeof encryptedPrivateKey !== "string") {
    throw new AppError("encryptedPrivateKey (base64 string) is required", 400);
  }

  // Sanity check — must be a non-empty base64-looking string
  if (encryptedPrivateKey.length < 32) {
    throw new AppError("encryptedPrivateKey appears invalid", 400);
  }

  await User.findByIdAndUpdate(
    req.user._id,
    { encryptedPrivateKey },
    { new: true },
  );

  res.status(200).json({ success: true, message: "Key backup stored" });
});

/**
 * GET /user/key-backup
 * Retrieve the caller's wrapped private key blob.
 * Returns null if no backup has been stored yet (first ever login).
 */
export const getKeyBackup = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("encryptedPrivateKey");
  if (!user) throw new AppError("User not found", 404);

  res.status(200).json({
    success: true,
    encryptedPrivateKey: user.encryptedPrivateKey ?? null,
  });
});
