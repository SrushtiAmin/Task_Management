import { Response } from "express";
import { Types } from "mongoose";
import Task from "../models/Task";
import Project from "../models/Project";
import ActivityLog from "../models/ActivityLog";
import { AuthRequest } from "../middleware/auth";

export class TaskController {

  // ===================== CREATE TASK =====================
  static async createTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const projectId = req.params.projectId;
      const { title, assignedTo, priority, dueDate } = req.body;

      // ✅ DB-side membership & ownership check
      const project = await Project.findOne({
        _id: projectId,
        members: userId,
      });

      if (!project) {
        return res.status(403).json({ message: "Access denied or project not found" });
      }

      if (req.user?.role !== "pm") {
        return res.status(403).json({ message: "Only project PM can create tasks" });
      }

      // ✅ Ensure assigned user belongs to project (DB-side)
      const memberExists = await Project.exists({
        _id: projectId,
        members: assignedTo,
      });

      if (!memberExists) {
        return res.status(400).json({ message: "Assigned user not in project" });
      }

      const task = await Task.create({
        title,
        project: projectId,
        assignedTo,
        createdBy: userId,
        priority,
        dueDate,
      });

      return res.status(201).json(task);
    } catch {
      return res.status(500).json({ message: "Failed to create task" });
    }
  }

  // ===================== GET TASKS (LIST / SUMMARY) =====================
  static async getTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const projectId = req.params.projectId;
      const { status, priority, assignedTo, summary } = req.query;

      // ✅ DB-side access check
      const hasAccess = await Project.exists({
        _id: projectId,
        members: userId,
      });

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const match: any = {
        project: new Types.ObjectId(projectId),
      };

      // Role-based filtering
      if (req.user?.role !== "pm") {
        match.assignedTo = new Types.ObjectId(userId);
      } else if (assignedTo) {
        match.assignedTo = new Types.ObjectId(assignedTo as string);
      }

      if (status) match.status = status;
      if (priority) match.priority = priority;

      // ---------- SUMMARY MODE (AGGREGATION) ----------
      if (summary === "true") {
        const result = await Task.aggregate([
          { $match: match },
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              priority: "$_id",
              count: 1,
            },
          },
        ]);

        const totalTasks = result.reduce((sum, r) => sum + r.count, 0);

        return res.status(200).json({
          totalTasks,
          byPriority: result,
        });
      }

      // ---------- NORMAL LIST ----------
      const tasks = await Task.find(match);
      return res.status(200).json(tasks);

    } catch {
      return res.status(500).json({ message: "Failed to fetch tasks" });
    }
  }

  // ===================== GET TASK BY ID =====================
  static async getTask(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // ✅ Single DB-side permission check
      const hasAccess = await Project.exists({
        _id: task.project,
        members: req.user!.userId,
      });

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      return res.status(200).json(task);
    } catch {
      return res.status(500).json({ message: "Failed to fetch task" });
    }
  }

  // ===================== UPDATE TASK =====================
  static async updateTask(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const isPM = req.user?.role === "pm";
      const isAssigned = task.assignedTo.toString() === req.user!.userId;

      if (!isPM && !isAssigned) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!isPM && Object.keys(req.body).some(k => k !== "status")) {
        return res.status(403).json({
          message: "Members can only update task status",
        });
      }

      Object.assign(task, req.body);
      await task.save();

      return res.status(200).json(task);
    } catch {
      return res.status(500).json({ message: "Failed to update task" });
    }
  }

  // ===================== UPDATE STATUS (LOGGED) =====================
  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const isPM = req.user?.role === "pm";
      const isAssigned = task.assignedTo.toString() === req.user!.userId;

      if (!isPM && !isAssigned) {
        return res.status(403).json({ message: "Access denied" });
      }

      const oldStatus = task.status;
      const newStatus = req.body.status;

      task.status = newStatus;
      await task.save();

      if (oldStatus !== newStatus) {
        await ActivityLog.create({
          entityType: "task",
          entityId: task._id,
          action: "status_change",
          oldValue: oldStatus,
          newValue: newStatus,
          performedBy: new Types.ObjectId(req.user!.userId),
        });
      }

      return res.status(200).json(task);
    } catch {
      return res.status(500).json({ message: "Failed to update status" });
    }
  }

  // ===================== DELETE TASK =====================
  static async deleteTask(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (req.user?.role !== "pm") {
        return res.status(403).json({ message: "Only project PM can delete task" });
      }

      await task.deleteOne();
      return res.status(204).send();
    } catch {
      return res.status(500).json({ message: "Delete failed" });
    }
  }

  // ===================== FILE UPLOAD =====================
  static async uploadFile(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const isPM = req.user?.role === "pm";
      const isAssigned = task.assignedTo.toString() === req.user!.userId;

      if (!isPM && !isAssigned) {
        return res.status(403).json({ message: "Not allowed" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (task.attachments.length >= 5) {
        return res.status(400).json({ message: "Max 5 attachments allowed" });
      }

      task.attachments.push({
        filename: req.file.filename,
        path: req.file.path,
        uploadedBy: new Types.ObjectId(req.user!.userId),
        uploadedAt: new Date(),
      });

      await task.save();

      return res.status(200).json({
        message: "File uploaded successfully",
        attachments: task.attachments,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to upload file",
        error: error.message,
      });
    }
  }
}
