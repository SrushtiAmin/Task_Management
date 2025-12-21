import { z } from 'zod';

/**
 * Add Comment Validation
 */
export const addCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(500, 'Comment must not exceed 500 characters'),
});
