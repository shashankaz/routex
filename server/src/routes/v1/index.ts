import { Router } from "express";
import { authRoutes } from "../../modules/auth/auth.routes.js";
import { userRoutes } from "../../modules/user/user.routes.js";
import { societyRoutes } from "../../modules/society/society.routes.js";
import { dishRoutes } from "../../modules/dish/dish.routes.js";
import { feedRoutes } from "../../modules/feed/feed.routes.js";
import { orderRoutes } from "../../modules/order/order.routes.js";
import { riderRoutes } from "../../modules/rider/rider.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/societies", societyRoutes);
router.use("/dishes", dishRoutes);
router.use("/feed", feedRoutes);
router.use("/orders", orderRoutes);
router.use("/rider", riderRoutes);

export { router };
