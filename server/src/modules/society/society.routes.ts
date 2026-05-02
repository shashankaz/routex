import { Router } from "express";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware";
import {
  getAllSocieties,
  createSociety,
  getSocietyById,
} from "./society.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/societies:
 *   get:
 *     tags: [Societies]
 *     summary: List all societies
 *     description: Returns all registered housing societies. Public endpoint — no auth required.
 *     responses:
 *       200:
 *         description: Societies retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     societies:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Society' }
 */
router.get("/", getAllSocieties);

/**
 * @swagger
 * /api/v1/societies/{id}:
 *   get:
 *     tags: [Societies]
 *     summary: Get society by ID
 *     description: Returns a single society by its UUID. Public endpoint — no auth required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Society UUID
 *     responses:
 *       200:
 *         description: Society found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     society: { $ref: '#/components/schemas/Society' }
 *       404:
 *         description: Society not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:id", getSocietyById);

/**
 * @swagger
 * /api/v1/societies:
 *   post:
 *     tags: [Societies]
 *     summary: Create a society
 *     description: Creates a new housing society. Requires authentication.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, example: "Green Valley Residency" }
 *     responses:
 *       201:
 *         description: Society created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     society: { $ref: '#/components/schemas/Society' }
 *       400:
 *         description: Name is required (min 2 chars)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/", requireAuthenticatedUser, createSociety);

export { router as societyRoutes };
