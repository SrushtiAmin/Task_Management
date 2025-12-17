// src/routes/commentRoutes.ts
import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { CommentController } from "../controllers/commentController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Task comments
 */

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   post:
 *     summary: Add comment to a task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post(
  "/tasks/:id/comments",
  authMiddleware,
  CommentController.addComment
);

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   get:
 *     summary: Get comments for a task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/tasks/:id/comments",
  authMiddleware,
  CommentController.getComments
);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete own comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/comments/:id",
  authMiddleware,
  CommentController.deleteComment
);

export default router;
