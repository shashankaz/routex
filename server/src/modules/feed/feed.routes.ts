import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware";
import { getFeed } from "./feed.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/feed:
 *   get:
 *     tags: [Feed]
 *     summary: Get dish feed
 *     description: >
 *       Returns all available (non-sold-out) dishes for the authenticated user's society.
 *       Supports optional query filters. Only residents typically use this endpoint,
 *       but any authenticated user can call it.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: lowCalorie
 *         schema: { type: string, enum: ["true", "false"] }
 *         description: Filter for low-calorie dishes
 *       - in: query
 *         name: veg
 *         schema: { type: string, enum: ["true", "false"] }
 *         description: Filter for vegetarian dishes only
 *       - in: query
 *         name: highProtein
 *         schema: { type: string, enum: ["true", "false"] }
 *         description: Filter for high-protein dishes
 *       - in: query
 *         name: mealSlot
 *         schema: { $ref: '#/components/schemas/MealSlot' }
 *         description: Filter by meal slot
 *     responses:
 *       200:
 *         description: Feed retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     dishes:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Dish' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", requireAuthenticatedUser, getFeed);

export { router as feedRoutes };
