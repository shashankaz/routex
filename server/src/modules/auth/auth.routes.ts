import { Router } from "express";
import { createRateLimiter } from "../../middlewares/rate-limiter.middleware.js";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware.js";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./auth.controller.js";

const router = Router();

const authRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

router.post("/register", authRateLimit, registerUser);
router.post("/login", authRateLimit, loginUser);
router.post("/refresh", authRateLimit, refreshAccessToken);
router.post("/logout", requireAuthenticatedUser, logoutUser);

router.get("/profile", requireAuthenticatedUser, getUserProfile);

export { router as authRoutes };
