/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and overview
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     description: >
 *       Returns dashboard statistics and overview data.
 *       PMs receive project-wise task breakdown.
 *       Members receive assigned task overview.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully.
 *       401:
 *         description: Unauthorized – authentication required.
 *       500:
 *         description: Internal Server Error.
 */
