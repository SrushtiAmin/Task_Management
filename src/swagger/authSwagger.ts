// src/swagger/auth.swagger.ts

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication related APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with a specific role (PM or Member).
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Test1234
 *               role:
 *                 type: string
 *                 enum: [pm, member]
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad Request – validation failed due to missing or invalid input fields.
 *       409:
 *         description: Conflict – a user with the given email already exists.
 *       500:
 *         description: Internal Server Error – failed to register user due to server issue.
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates user credentials and returns a JWT token on success.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Test1234
 *     responses:
 *       200:
 *         description: Login successful – JWT token generated.
 *       400:
 *         description: Bad Request – validation failed due to missing or invalid input.
 *       401:
 *         description: Unauthorized – invalid email or password.
 *       500:
 *         description: Internal Server Error – login failed due to server issue.
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     description: Returns details of the currently authenticated user using JWT token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved current user information.
 *       401:
 *         description: Unauthorized – missing or invalid JWT token.
 *       500:
 *         description: Internal Server Error – failed to fetch user information.
 */
