// jwtAuth.js
import jwt from "jsonwebtoken"; // Correct import for jsonwebtoken

const createTokenAndSaveCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
  console.log("JWT_TOKEN LOCAL:", process.env.JWT_SECRET);
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  return token;
};

export default createTokenAndSaveCookie;
