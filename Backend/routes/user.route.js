import express from "express";
import upload from "../middleware/multer.js";
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
  (req, res, next) => {
    upload.single("avatar")(req, res, function (err) {
      if (err) {
        return next(err); // send to global error handler
      }
      next();
    });
  },
  signUp,
);
router.post("/login", authLimiter, signIn);
router.post("/logout", signOut);
router.get("/users", secureRoute, allUsers);

export default router;
