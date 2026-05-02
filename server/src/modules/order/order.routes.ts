import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { placeOrder, getMyOrders, cancelOrder } from "./order.controller";

const router = Router();

router.use(requireAuthenticatedUser);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place an order
 *     description: >
 *       Places a new order for a dish. Only users with the `RESIDENT` role can place orders.
 *       The system uses the resident's stored coordinates to find the nearest available rider.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dishId]
 *             properties:
 *               dishId: { type: string, format: uuid, example: "d1e2f3a4-..." }
 *     responses:
 *       201:
 *         description: Order placed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     order: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: dishId is required, or dish is sold out / out of stock
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Forbidden — RESIDENT role required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/", requireRole("RESIDENT"), placeOrder);

/**
 * @swagger
 * /api/v1/orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: Get my orders
 *     description: >
 *       Returns orders relevant to the authenticated user.
 *       Residents see their own placed orders.
 *       Chefs see orders for their dishes.
 *       Riders see orders assigned to them.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Order' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/my", getMyOrders);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Cancel an order
 *     description: >
 *       Cancels a `PENDING` order. Only the resident who placed the order can cancel it.
 *       Orders in other statuses cannot be cancelled.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Order cancelled
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     order: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Order cannot be cancelled in its current status
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Forbidden — RESIDENT role required or not your order
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete("/:id", requireRole("RESIDENT"), cancelOrder);

export { router as orderRoutes };
