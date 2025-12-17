import { Router } from "express";
import { ProjectController } from "../controllers/projectController";
import authMiddleware from "../middleware/auth";
import { roleCheck } from "../middleware/rolecheck";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project (PM only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Task Management System
 *               description:
 *                 type: string
 *                 example: Backend project for internship
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Project created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (PM only)
 */
router.post(
  "/",
  authMiddleware,
  roleCheck(["pm"]),
  ProjectController.createProject
);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects for logged-in user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authMiddleware,
  ProjectController.getProjects
);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
router.get(
  "/:id",
  authMiddleware,
  ProjectController.getProjectById
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project (PM only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, completed, archived]
 *     responses:
 *       200:
 *         description: Project updated
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authMiddleware,
  roleCheck(["pm"]),
  ProjectController.updateProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project (PM only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  authMiddleware,
  roleCheck(["pm"]),
  ProjectController.deleteProject
);

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Add a member to project (PM only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: string
 *                 example: 64fa123abc456def78901234
 *     responses:
 *       200:
 *         description: Member added successfully
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:id/members",
  authMiddleware,
  roleCheck(["pm"]),
  ProjectController.addMember
);

export default router;
