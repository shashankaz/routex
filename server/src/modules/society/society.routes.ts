import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware.js";
import {
  getAllSocieties,
  createSociety,
  getSocietyById,
} from "./society.controller.js";

const router = Router();

router.get("/", getAllSocieties);
router.get("/:id", getSocietyById);

router.post("/", requireAuthenticatedUser, createSociety);

export { router as societyRoutes };
