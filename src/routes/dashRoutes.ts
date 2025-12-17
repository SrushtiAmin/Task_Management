import { Router } from "express";
import auth from "../middleware/auth";
import { DashboardController } from "../controllers/dashController";

const router = Router();
router.get("/dashboard", auth, DashboardController.getStats);
export default router;
