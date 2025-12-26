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
 *     summary: Create a new project
 *     description: Creates a new project. Only Project Managers are allowed.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Only PM can create project
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Returns projects where the user is a member or owner
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

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
 *     responses:
 *       200:
 *         description: Project fetched successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     description: |
 *       Updates project fields.
 *       If status is changed, the change is logged in status history.
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
 *         description: Project updated successfully
 *       400:
 *         description: Invalid update
 *       403:
 *         description: Only PM can update
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     description: Only archived projects can be deleted by PM
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Project deleted
 *       400:
 *         description: Project has active tasks
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Add member to project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member added
 *       400:
 *         description: User already member
 *       403:
 *         description: Only PM allowed
 */

/**
 * @swagger
 * /api/projects/{projectId}/dashboard:
 *   get:
 *     summary: Get project dashboard
 *     description: |
 *       PM can view dashboard for entire project,
 *       filter by memberId or taskId.
 *       Members can view only their assigned tasks.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *         description: PM only
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *         description: PM / member own task
 *     responses:
 *       200:
 *         description: Dashboard data
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
