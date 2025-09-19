// jwtAuth.js
import jwt from "jsonwebtoken"; // Correct import for jsonwebtoken

const createTokenAndSaveCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_TOKEN, {
    expiresIn: "10d",
  });
  console.log("Server setting cookie with token:", token);
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