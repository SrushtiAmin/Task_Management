import { z } from 'zod';
import { taskStatus } from '../constants/taskStatus';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),

  project: z.string().min(1, 'Project ID is required'),

  assignedTo: z.string().min(1, 'Assigned user ID is required'),

  priority: z
    .enum(['low', 'medium', 'high', 'critical'])
    .refine((val) => ['low', 'medium', 'high', 'critical'].includes(val), {
      message: 'Priority must be low, medium, high, or critical',
    }),

  dueDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Due date must be a valid date')
    .refine(
      (date) => new Date(date) > new Date(),
      'Due date must be in the future'
    ),
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateStatusSchema = z.object({
  status: z
    .enum([
      taskStatus.todo,
      taskStatus.inProgress,
      taskStatus.inReview,
      taskStatus.done,
    ])
    .refine(
      (val) =>
        [
          taskStatus.todo,
          taskStatus.inProgress,
          taskStatus.inReview,
          taskStatus.done,
        ].includes(val),
      { message: 'Invalid task status' }
    ),
});
