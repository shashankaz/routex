import { Router } from "express";
import { createRateLimiter } from "../../middlewares/rate-limiter.middleware";
import { requireAuthenticatedUser } from "../../middlewares/require-authenticated-user.middleware";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./auth.controller";

const router = Router();

const authRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: >
 *       Creates a new account. The `role` must be one of `CHEF`, `RESIDENT`, or `RIDER`.
 *       `societyId` must reference an existing society.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role, societyId]
 *             properties:
 *               name:      { type: string, example: "Priya Sharma" }
 *               email:     { type: string, format: email, example: "priya@example.com" }
 *               password:  { type: string, format: password, example: "Secret@123" }
 *               role:      { $ref: '#/components/schemas/Role' }
 *               societyId: { type: string, format: uuid, example: "a1b2c3d4-..." }
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId: { type: string, format: uuid }
 *       400:
 *         description: Validation error (missing fields or invalid role)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/register", authRateLimit, registerUser);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     description: >
 *       Authenticates the user and sets two HTTP-only cookies:
 *       `__auth_at` (access token, 15 min) and `__auth_rt` (refresh token, 7 days).
 *       The `accessToken` is also returned in the response body for convenience.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: "priya@example.com" }
 *               password: { type: string, format: password, example: "Secret@123" }
 *     responses:
 *       200:
 *         description: Logged in — cookies are set
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken: { type: string }
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/login", authRateLimit, loginUser);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: >
 *       Reads the `__auth_rt` cookie, validates it, and issues a new access token +
 *       a rotated refresh token (both set as cookies). Call this when the access token expires.
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken: { type: string }
 *       400:
 *         description: Refresh token cookie missing
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/refresh", authRateLimit, refreshAccessToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     description: Invalidates the current refresh token and clears both auth cookies.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/logout", requireAuthenticatedUser, logoutUser);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile (auth context)
 *     description: Returns the profile of the currently authenticated user from the JWT payload.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:          { type: string, format: uuid }
 *                     name:        { type: string }
 *                     email:       { type: string }
 *                     role:        { $ref: '#/components/schemas/Role' }
 *                     societyId:   { type: string, format: uuid }
 *                     isAvailable: { type: boolean }
 *                     lat:         { type: number, nullable: true }
 *                     lng:         { type: number, nullable: true }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/profile", requireAuthenticatedUser, getUserProfile);

export { router as authRoutes };
