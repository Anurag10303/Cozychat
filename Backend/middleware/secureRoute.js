import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

const secureRoute = async (req, res, next) => {
  try {
    // FIX: check both cookie AND Authorization header
    // Cookie used by browser sessions, header used by fetch with localStorage token
    let token = req.cookies?.jwt;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return next(new AppError("Unauthorized: No token provided", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new AppError("Token verification failed", 401));
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default secureRoute;
