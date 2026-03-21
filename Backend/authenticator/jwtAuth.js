import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

const createTokenAndSaveCookie = (userId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not defined", 500);
  }

  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d", // match cookie
    }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  return token;
};

export default createTokenAndSaveCookie;