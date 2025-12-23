import { z } from "zod";
import { taskStatus } from "../constants/taskStatus";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),

  assignedTo: z.string().min(1),

  priority: z.enum(["low", "medium", "high", "critical"]),

  dueDate: z
    .string()
    .refine(d => !isNaN(Date.parse(d)), "Invalid date")
    .refine(d => new Date(d) > new Date(), "Due date must be future"),
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum([
    taskStatus.todo,
    taskStatus.inProgress,
    taskStatus.inReview,
    taskStatus.done,
  ]),
});
