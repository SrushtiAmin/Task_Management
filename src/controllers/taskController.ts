import { Response } from 'express';
import { Types } from 'mongoose';
import Task from '../models/Task';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';

const STATUS_FLOW = ['todo', 'in_progress', 'in_review', 'done'];

export class TaskController {
  // CREATE TASK (PM only)
  static async createTask(req: AuthRequest, res: Response) {
    const { title, project, assignedTo, priority, dueDate } = req.body;

    if (!req.user || req.user.role !== 'pm') {
      return res.status(403).json({ message: 'PM only' });
    }

    const proj = await Project.findById(project);
    if (!proj || !proj.members.includes(new Types.ObjectId(assignedTo))) {
      return res.status(400).json({ message: 'Assigned user not in project' });
    }

    const task = await Task.create({
      title,
      project,
      assignedTo,
      createdBy: req.user.userId,
      priority,
      dueDate,
    });

    res.status(201).json(task);
  }

  // LIST TASKS
  static async getTasks(req: AuthRequest, res: Response) {
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    res.json(await Task.find(filter));
  }

  // GET TASK
  static async getTask(req: AuthRequest, res: Response) {
    res.json(await Task.findById(req.params.id));
  }

  // UPDATE TASK
  static async updateTask(req: AuthRequest, res: Response) {
    res.json(
      await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    );
  }

  // DELETE TASK (PM only)
  static async deleteTask(req: AuthRequest, res: Response) {
    if (req.user?.role !== 'pm') {
      return res.status(403).json({ message: 'PM only' });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  }

  // STATUS UPDATE (RULES)
  static async updateStatus(req: AuthRequest, res: Response) {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const newStatus = req.body.status;
    const currIndex = STATUS_FLOW.indexOf(task.status);
    const newIndex = STATUS_FLOW.indexOf(newStatus);

    if (req.user?.role !== 'pm') {
      if (task.assignedTo.toString() !== req.user?.userId)
        return res.status(403).json({ message: 'Not assigned' });
      if (newIndex !== currIndex + 1)
        return res.status(400).json({ message: 'Invalid status flow' });
    }

    task.status = newStatus;
    await task.save();
    res.json(task);
  }

  // FILE UPLOAD
  // FILE UPLOAD
  static async uploadFile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Permission check: PM or assigned user
      const isPM = req.user.role === 'pm';
      const isAssignedUser = task.assignedTo.toString() === req.user.userId;

      if (!isPM && !isAssignedUser) {
        return res.status(403).json({
          message: 'You are not allowed to upload files for this task',
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Total file limit per task (max 5)
      if (task.attachments.length >= 5) {
        return res.status(400).json({
          message: 'Maximum 5 attachments allowed per task',
        });
      }

      task.attachments.push({
        filename: req.file.filename,
        path: req.file.path,
        uploadedBy: new Types.ObjectId(req.user.userId),
        uploadedAt: new Date(),
      });

      await task.save();

      return res.status(200).json({
        message: 'File uploaded successfully',
        attachments: task.attachments,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: 'Failed to upload file',
        error: error.message,
      });
    }
  }
}
