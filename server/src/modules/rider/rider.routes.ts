import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  toggleAvailability,
  getRiderOrders,
  acceptOrder,
  updateOrderStatus,
} from "./rider.controller";

const router = Router();

router.use(requireAuthenticatedUser, requireRole("RIDER"));

/**
 * @swagger
 * /api/v1/rider/availability:
 *   patch:
 *     tags: [Rider]
 *     summary: Toggle rider availability
 *     description: >
 *       Toggles the `isAvailable` flag on the authenticated rider's profile.
 *       When available, the rider is eligible to be assigned to new orders by the matching engine.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Availability toggled
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     isAvailable: { type: boolean, example: true }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Forbidden — RIDER role required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/availability", toggleAvailability);

/**
 * @swagger
 * /api/v1/rider/orders:
 *   get:
 *     tags: [Rider]
 *     summary: Get rider's assigned orders
 *     description: Returns all orders currently assigned to the authenticated rider.
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
 *       403:
 *         description: Forbidden — RIDER role required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/orders", getRiderOrders);

/**
 * @swagger
 * /api/v1/rider/orders/{orderId}/accept:
 *   post:
 *     tags: [Rider]
 *     summary: Accept an assigned order
 *     description: >
 *       Transitions an order from `ASSIGNED` to `ACCEPTED` status.
 *       The rider must be the one assigned to this order.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Order accepted
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
 *         description: orderId is required or order is not in ASSIGNED state
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/orders/:orderId/accept", acceptOrder);

/**
 * @swagger
 * /api/v1/rider/orders/{orderId}/status:
 *   patch:
 *     tags: [Rider]
 *     summary: Update order delivery status
 *     description: >
 *       Updates an order's status. Riders can only set status to `PICKED_UP` or `DELIVERED`.
 *       The order must be assigned to this rider.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Order UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PICKED_UP, DELIVERED]
 *                 example: PICKED_UP
 *     responses:
 *       200:
 *         description: Order status updated
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
 *         description: Invalid or missing status
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/orders/:orderId/status", updateOrderStatus);

export { router as riderRoutes };
