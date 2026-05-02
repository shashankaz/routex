import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  createDish,
  getMyDishes,
  getDishById,
  updateDish,
  markSoldOut,
  restockDish,
  getChefAnalytics,
} from "./dish.controller";

const router = Router();

router.use(requireAuthenticatedUser);

/**
 * @swagger
 * /api/v1/dishes:
 *   post:
 *     tags: [Dishes]
 *     summary: Create a dish
 *     description: Creates a new dish listing. Only accessible by users with the `CHEF` role.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, quantity]
 *             properties:
 *               name:     { type: string, example: "Dal Makhani" }
 *               price:    { type: number, example: 120 }
 *               quantity: { type: integer, example: 10 }
 *               mediaUrl: { type: string, nullable: true, example: "https://cdn.example.com/dal.jpg" }
 *               mealSlot: { $ref: '#/components/schemas/MealSlot' }
 *     responses:
 *       201:
 *         description: Dish created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     dish: { $ref: '#/components/schemas/Dish' }
 *       400:
 *         description: name, price, and quantity are required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Forbidden — CHEF role required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/", requireRole("CHEF"), createDish);

/**
 * @swagger
 * /api/v1/dishes/my:
 *   get:
 *     tags: [Dishes]
 *     summary: Get my dishes
 *     description: Returns all dishes created by the authenticated chef.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dishes retrieved
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
 *       403:
 *         description: Forbidden — CHEF role required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/my", requireRole("CHEF"), getMyDishes);

/**
 * @swagger
 * /api/v1/dishes/analytics:
 *   get:
 *     tags: [Dishes]
 *     summary: Get chef analytics
 *     description: Returns aggregate statistics for the authenticated chef (total dishes, orders, revenue, sold-out count).
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     analytics: { $ref: '#/components/schemas/ChefAnalytics' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Forbidden — CHEF role required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/analytics", requireRole("CHEF"), getChefAnalytics);

/**
 * @swagger
 * /api/v1/dishes/{id}/sold-out:
 *   patch:
 *     tags: [Dishes]
 *     summary: Mark dish as sold out
 *     description: Sets `isSoldOut = true` on the dish. Only the owning chef can call this.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Dish UUID
 *     responses:
 *       200:
 *         description: Dish marked as sold out
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     dish: { $ref: '#/components/schemas/Dish' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Forbidden — CHEF role required or dish not owned by this chef
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/:id/sold-out", requireRole("CHEF"), markSoldOut);

/**
 * @swagger
 * /api/v1/dishes/{id}/restock:
 *   patch:
 *     tags: [Dishes]
 *     summary: Restock a dish
 *     description: >
 *       Sets a new `quantity` on the dish and marks it as available (`isSoldOut = false`).
 *       Only the owning chef can call this.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Dish UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 1, example: 15 }
 *     responses:
 *       200:
 *         description: Dish restocked
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     dish: { $ref: '#/components/schemas/Dish' }
 *       400:
 *         description: quantity must be at least 1
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
 */
router.patch("/:id/restock", requireRole("CHEF"), restockDish);

/**
 * @swagger
 * /api/v1/dishes/{id}:
 *   patch:
 *     tags: [Dishes]
 *     summary: Update a dish
 *     description: >
 *       Partially updates a dish's fields. At least one field must be provided.
 *       Only the owning chef can update their dish.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Dish UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:     { type: string, example: "Dal Makhani (updated)" }
 *               price:    { type: number, example: 130 }
 *               quantity: { type: integer, example: 8 }
 *               mediaUrl: { type: string, nullable: true }
 *               mealSlot: { $ref: '#/components/schemas/MealSlot' }
 *     responses:
 *       200:
 *         description: Dish updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     dish: { $ref: '#/components/schemas/Dish' }
 *       400:
 *         description: At least one field to update is required
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
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/:id", requireRole("CHEF"), updateDish);

/**
 * @swagger
 * /api/v1/dishes/{id}:
 *   get:
 *     tags: [Dishes]
 *     summary: Get dish by ID
 *     description: Returns a single dish. Accessible by any authenticated user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Dish UUID
 *     responses:
 *       200:
 *         description: Dish found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     dish: { $ref: '#/components/schemas/Dish' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:id", getDishById);

export { router as dishRoutes };
