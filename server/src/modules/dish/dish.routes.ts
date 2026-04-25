import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import {
  createDish,
  getMyDishes,
  getDishById,
  updateDish,
  markSoldOut,
  restockDish,
} from "./dish.controller.js";

const router = Router();

router.use(requireAuthenticatedUser);

router.post("/", requireRole("CHEF"), createDish);
router.get("/my", requireRole("CHEF"), getMyDishes);

router.patch("/:id/sold-out", requireRole("CHEF"), markSoldOut);
router.patch("/:id/restock", requireRole("CHEF"), restockDish);
router.patch("/:id", requireRole("CHEF"), updateDish);

router.get("/:id", getDishById);

export { router as dishRoutes };
