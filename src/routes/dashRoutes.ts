import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { getDashboard } from "../controllers/dashController";

const router = Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data for PM or Member
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard", authMiddleware, getDashboard);

export default router;
