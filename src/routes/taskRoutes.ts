import { Router } from "express";
import auth from "../middleware/auth";
import { roleCheck } from "../middleware/rolecheck";
import { validateRequest } from "../middleware/validateRequest";
import { TaskController } from "../controllers/taskController";
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
} from "../validators/taskValidator";
import { uploadTaskAttachment } from "../middleware/uploadMiddleware";

const router = Router();

// ================= PROJECT SCOPED TASK ROUTES =================

// Create task (PM only)
router.post(
  "/projects/:projectId/tasks",
  auth,
  roleCheck(["pm"]),
  validateRequest(createTaskSchema),
  TaskController.createTask
);

//  Get tasks / filters / summary (PM & Members)
router.get(
  "/projects/:projectId/tasks",
  auth,
  TaskController.getTasks
);

// ================= TASK SPECIFIC ROUTES =================

// Get task by ID
router.get("/tasks/:id", auth, TaskController.getTask);

// Update task
router.put(
  "/tasks/:id",
  auth,
  validateRequest(updateTaskSchema),
  TaskController.updateTask
);

// Delete task (PM only)
router.delete(
  "/tasks/:id",
  auth,
  roleCheck(["pm"]),
  TaskController.deleteTask
);

// Update status
router.patch(
  "/tasks/:id/status",
  auth,
  validateRequest(updateStatusSchema),
  TaskController.updateStatus
);

// Upload attachment
router.post(
  "/tasks/:id/upload",
  auth,
  uploadTaskAttachment,
  TaskController.uploadFile
);

export default router;
