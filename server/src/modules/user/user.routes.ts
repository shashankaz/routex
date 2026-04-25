import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware.js";
import {
  getMyProfile,
  updateMyProfile,
  updateMyLocation,
} from "./user.controller.js";

const router = Router();

router.use(requireAuthenticatedUser);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.patch("/me/location", updateMyLocation);

export { router as userRoutes };
