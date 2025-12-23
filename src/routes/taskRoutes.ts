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

// Project scoped routes
router.post(
  "/projects/:projectId/tasks",
  auth,
  roleCheck(["pm"]),
  validateRequest(createTaskSchema),
  TaskController.createTask
);

router.get(
  "/projects/:projectId/tasks",
  auth,
  TaskController.getTasks
);

// Task specific routes
router.get("/tasks/:id", auth, TaskController.getTask);

router.put(
  "/tasks/:id",
  auth,
  validateRequest(updateTaskSchema),
  TaskController.updateTask
);

router.delete(
  "/tasks/:id",
  auth,
  roleCheck(["pm"]),
  TaskController.deleteTask
);

router.patch(
  "/tasks/:id/status",
  auth,
  validateRequest(updateStatusSchema),
  TaskController.updateStatus
);

router.post(
  "/tasks/:id/upload",
  auth,
  uploadTaskAttachment,
  TaskController.uploadFile
);

export default router;
