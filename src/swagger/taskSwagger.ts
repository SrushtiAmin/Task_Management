/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create task
 *     description: Creates a new task under a project. Only Project Managers are allowed.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Task created successfully.
 *       400:
 *         description: Bad Request – validation failed.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden – PM only.
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get tasks
 *     description: Returns all tasks for PM or assigned tasks for team members.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task details retrieved.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Task not found.
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task
 *     description: Updates task details.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *       400:
 *         description: Bad Request – validation failed.
 *       403:
 *         description: Forbidden.
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     description: Deletes a task. Only Project Managers are allowed.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *       403:
 *         description: Forbidden – PM only.
 */

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     description: Updates task workflow status. Members follow sequence, PM can override.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task status updated successfully.
 *       400:
 *         description: Invalid status transition.
 */

/**
 * @swagger
 * /api/tasks/{id}/upload:
 *   post:
 *     summary: Upload attachment
 *     description: Uploads an image or PDF attachment to a task.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File uploaded successfully.
 *       400:
 *         description: Invalid file or upload error.
 */
