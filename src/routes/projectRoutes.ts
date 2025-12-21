import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import authMiddleware from '../middleware/auth';
import { roleCheck } from '../middleware/rolecheck';
import { validateRequest } from '../middleware/validateRequest';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../validators/projectValidator';

const router = Router();

// Create project (PM only)
router.post(
  '/',
  authMiddleware,
  roleCheck(['pm']),
  validateRequest(createProjectSchema),
  ProjectController.createProject
);

// Get all projects for logged-in user
router.get('/', authMiddleware, ProjectController.getProjects);

// Get project by ID
router.get('/:id', authMiddleware, ProjectController.getProjectById);

// Update project (PM only)
router.put(
  '/:id',
  authMiddleware,
  roleCheck(['pm']),
  validateRequest(updateProjectSchema),
  ProjectController.updateProject
);

// Delete project (PM only)
router.delete(
  '/:id',
  authMiddleware,
  roleCheck(['pm']),
  ProjectController.deleteProject
);

// Add member to project (PM only)
router.post(
  '/:id/members',
  authMiddleware,
  roleCheck(['pm']),
  ProjectController.addMember
);

export default router;
