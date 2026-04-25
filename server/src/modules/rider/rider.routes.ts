import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import {
  toggleAvailability,
  getRiderOrders,
  acceptOrder,
  updateOrderStatus,
} from "./rider.controller.js";

const router = Router();

router.use(requireAuthenticatedUser, requireRole("RIDER"));

router.patch("/availability", toggleAvailability);
router.get("/orders", getRiderOrders);
router.post("/orders/:orderId/accept", acceptOrder);
router.patch("/orders/:orderId/status", updateOrderStatus);

export { router as riderRoutes };
