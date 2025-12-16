import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { ProjectController } from "../controllers/projectController";

const router = Router();

// All project routes are protected
router.use(authMiddleware);

// Create project (PM only)
router.post("/", ProjectController.createProject);

// Get all projects of logged-in user
router.get("/", ProjectController.getProjects);

// Get single project
router.get("/:id", ProjectController.getProjectById);

// Update project (PM only)
router.put("/:id", ProjectController.updateProject);

// Delete project (PM only)
router.delete("/:id", ProjectController.deleteProject);

// Add member to project (PM only)
router.post("/:id/members", ProjectController.addMember);

export default router;
