import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { CommentController } from '../controllers/commentController';
import { addCommentSchema } from '../validators/commentValidator';

const router = Router();

// Add comment to task
router.post(
  '/tasks/:id/comments',
  authMiddleware,
  validateRequest(addCommentSchema),
  CommentController.addComment
);

// Get comments for a task
router.get(
  '/tasks/:id/comments',
  authMiddleware,
  CommentController.getComments
);

// Delete own comment
router.delete('/comments/:id', authMiddleware, CommentController.deleteComment);

export default router;
