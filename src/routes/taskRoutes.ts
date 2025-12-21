import { Router } from 'express';
import auth from '../middleware/auth';
import { roleCheck } from '../middleware/rolecheck';
import { validateRequest } from '../middleware/validateRequest';
import { TaskController } from '../controllers/taskController';
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
} from '../validators/taskValidator';
import { uploadTaskAttachment } from '../middleware/uploadMiddleware';

const router = Router();

// Create task (PM only)
router.post(
  '/',
  auth,
  roleCheck(['pm']),
  validateRequest(createTaskSchema),
  TaskController.createTask
);

// Get tasks (PM: all, Member: assigned)
router.get('/', auth, TaskController.getTasks);

// Get task by ID
router.get('/:id', auth, TaskController.getTask);

// Update task details
router.put(
  '/:id',
  auth,
  validateRequest(updateTaskSchema),
  TaskController.updateTask
);

// Delete task (PM only)
router.delete('/:id', auth, roleCheck(['pm']), TaskController.deleteTask);

// Update task status
router.patch(
  '/:id/status',
  auth,
  validateRequest(updateStatusSchema),
  TaskController.updateStatus
);

// Upload attachment to task
router.post(
  '/:id/upload',
  auth,
  uploadTaskAttachment,
  TaskController.uploadFile
);

export default router;
