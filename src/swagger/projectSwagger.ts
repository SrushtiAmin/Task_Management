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
 *         description: Project created successfully.
 *       400:
 *         description: Bad Request – validation failed due to invalid input.
 *       401:
 *         description: Unauthorized – user not authenticated.
 *       403:
 *         description: Forbidden – only Project Managers can create projects.
 *       500:
 *         description: Internal Server Error – project creation failed.
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Returns all projects the logged-in user is a member of.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully.
 *       401:
 *         description: Unauthorized – user not authenticated.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Returns project details by project ID.
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
 *         description: Project details retrieved successfully.
 *       401:
 *         description: Unauthorized – user not authenticated.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     description: Updates project details. Only Project Managers are allowed.
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
 *         description: Project updated successfully.
 *       400:
 *         description: Bad Request – validation failed.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden – only Project Managers can update projects.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     description: Deletes a project. Only Project Managers are allowed.
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
 *         description: Project deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden – only Project Managers can delete projects.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Add member to project
 *     description: Adds a team member to a project. Only Project Managers are allowed.
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
 *                 example: 64fa123abc456def78901234
 *     responses:
 *       200:
 *         description: Member added successfully.
 *       400:
 *         description: Bad Request – invalid member ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden – only Project Managers can add members.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal Server Error.
 */
