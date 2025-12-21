/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Task comments APIs
 */

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   post:
 *     summary: Add comment to a task
 *     description: Adds a comment to the specified task.
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
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: This task needs to be completed by tomorrow.
 *     responses:
 *       201:
 *         description: Comment added successfully.
 *       400:
 *         description: Bad Request – validation failed.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Task not found.
 */

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   get:
 *     summary: Get comments for a task
 *     description: Retrieves all comments associated with a task.
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
 *     responses:
 *       200:
 *         description: Comments retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Task not found.
 */

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete comment
 *     description: Deletes the logged-in user’s own comment.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Comment ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden – cannot delete another user’s comment.
 *       404:
 *         description: Comment not found.
 */
