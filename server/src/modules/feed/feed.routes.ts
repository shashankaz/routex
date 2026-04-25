import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware.js";
import { getFeed } from "./feed.controller.js";

const router = Router();

router.get("/", requireAuthenticatedUser, getFeed);

export { router as feedRoutes };
