import { Router } from "express";
import { authRoutes } from "../../modules/auth/auth.routes";
import { userRoutes } from "../../modules/user/user.routes";
import { societyRoutes } from "../../modules/society/society.routes";
import { dishRoutes } from "../../modules/dish/dish.routes";
import { feedRoutes } from "../../modules/feed/feed.routes";
import { orderRoutes } from "../../modules/order/order.routes";
import { riderRoutes } from "../../modules/rider/rider.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/societies", societyRoutes);
router.use("/dishes", dishRoutes);
router.use("/feed", feedRoutes);
router.use("/orders", orderRoutes);
router.use("/rider", riderRoutes);

export { router };
