// src/routes/authRoutes.ts
import { Router } from "express";
import { AuthController } from "../controllers/authController";
import authMiddleware from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import { registerSchema, loginSchema } from "../validators/authValidator";

const router = Router();

router.post("/register", validateRequest(registerSchema), AuthController.register);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.get("/me", authMiddleware, AuthController.getCurrentUser);

export default router;
