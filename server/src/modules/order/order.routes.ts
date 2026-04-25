import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { placeOrder, getMyOrders, cancelOrder } from "./order.controller.js";

const router = Router();

router.use(requireAuthenticatedUser);

router.post("/", requireRole("RESIDENT"), placeOrder);
router.get("/my", getMyOrders);
router.delete("/:id", requireRole("RESIDENT"), cancelOrder);

export { router as orderRoutes };
