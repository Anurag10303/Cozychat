import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

const secureRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

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
    // IMPORTANT: forward error to global handler
    next(error);
  }
};

export default secureRoute;
