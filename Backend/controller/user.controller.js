import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import createTokenAndSaveCookie from "../authenticator/jwtAuth.js";

export const signUp = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;
  const avatar = req.file?.filename;

  if (!fullName || !email || !password || !confirmPassword) {
    throw new AppError("All fields are required", 400);
  }

  if (password !== confirmPassword) {
    throw new AppError("Passwords do not match", 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
    avatar,
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

// user.controller.js (signIn section)
export const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid email or password", 400);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 400);
  }

  const token = createTokenAndSaveCookie(user._id, res);

  res.status(200).json({
    success: true,
    message: "Sign in successful",
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
  });
});

// user.controller.js (signOut section)
export const signOut = asyncHandler(async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

// user.controller.js (allUsers section)
export const allUsers = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new AppError("Unauthorized: No user ID found", 401);
  }

  const loggedInUser = req.user._id;

  const filteredUsers = await User.find({
    _id: { $ne: loggedInUser },
  }).select("-password");

  res.status(200).json({
    success: true,
    data: filteredUsers,
  });
});
