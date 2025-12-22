import { Response } from "express";
import { Types } from "mongoose";
import Task from "../models/Task";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/auth";

const STATUS_FLOW = ["todo", "in_progress", "in_review", "done"];

export class TaskController {
  //  CREATE TASK (PM only)
  static async createTask(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "pm") {
        return res.status(403).json({ message: "Only PM can create tasks" });
      }

      const { title, project, assignedTo, priority, dueDate } = req.body;

      const proj = await Project.findById(project);
      if (!proj) {
        return res.status(404).json({ message: "Project not found" });
      }

      // PM must be part of project
      if (!proj.members.some((m) => m.toString() === req.user!.userId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Assigned user must be project member
      if (!proj.members.some((m) => m.toString() === assignedTo)) {
        return res
          .status(400)
          .json({ message: "Assigned user not in project" });
      }

      const task = await Task.create({
        title,
        project,
        assignedTo,
        createdBy: req.user!.userId,
        priority,
        dueDate,
      });

      return res.status(201).json(task);
    } catch {
      return res.status(500).json({ message: "Failed to create task" });
    }
  }

  //  GET ALL TASKS (PM & Member – only related tasks + filters)
  static async getTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const filter: any = {};

      // Role-based access
      if (req.user?.role === "pm") {
        filter.$or = [
          { createdBy: new Types.ObjectId(userId) },
          { assignedTo: new Types.ObjectId(userId) },
        ];
      } else {
        filter.assignedTo = new Types.ObjectId(userId);
      }

      // Optional filters
      if (req.query.status) filter.status = req.query.status;
      if (req.query.priority) filter.priority = req.query.priority;
      if (req.query.project) filter.project = req.query.project;
      if (req.query.assignedTo)
        filter.assignedTo = req.query.assignedTo;

      const tasks = await Task.find(filter);
      return res.status(200).json(tasks);
    } catch {
      return res.status(500).json({ message: "Failed to fetch tasks" });
    }
  }

  //  GET TASK BY ID (only assigned user or PM of project)
  static async getTask(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const isAssigned =
        task.assignedTo.toString() === req.user!.userId;

      if (!isAssigned && req.user?.role !== "pm") {
        return res.status(403).json({ message: "Access denied" });
      }

      return res.status(200).json(task);
    } catch {
      return res.status(500).json({ message: "Failed to fetch task" });
    }
  }

  //  UPDATE TASK
  static async updateTask(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const isAssigned =
        task.assignedTo.toString() === req.user!.userId;

      if (!isAssigned && req.user?.role !== "pm") {
        return res.status(403).json({ message: "Access denied" });
      }

      // Member can update only status
      if (req.user?.role !== "pm") {
        if (Object.keys(req.body).some((f) => f !== "status")) {
          return res.status(403).json({
            message: "Members can only update task status",
          });
        }
      }

      Object.assign(task, req.body);
      await task.save();

      return res.status(200).json(task);
    } catch {
      return res.status(500).json({ message: "Failed to update task" });
    }
  }

  //  DELETE TASK (PM only)
  static async deleteTask(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "pm") {
        return res.status(403).json({ message: "Only PM can delete task" });
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      await task.deleteOne();
      return res.status(204).send();
    } catch {
      return res.status(500).json({ message: "Delete failed" });
    }
  }

  //  UPDATE STATUS (workflow enforced)
  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const newStatus = req.body.status;
      const currIndex = STATUS_FLOW.indexOf(task.status);
      const newIndex = STATUS_FLOW.indexOf(newStatus);

      const isAssigned =
        task.assignedTo.toString() === req.user!.userId;

      if (!isAssigned && req.user?.role !== "pm") {
        return res.status(403).json({ message: "Not assigned" });
      }

      if (req.user?.role !== "pm" && newIndex !== currIndex + 1) {
        return res.status(400).json({ message: "Invalid status flow" });
      }

      task.status = newStatus;
      await task.save();

      return res.status(200).json(task);
    } catch {
      return res.status(500).json({ message: "Failed to update status" });
    }
  }

  //  FILE UPLOAD (PM or assigned user, max 5 files)
  static async uploadFile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const isAssigned =
        task.assignedTo.toString() === req.user.userId;
      const isPM = req.user.role === "pm";

      if (!isAssigned && !isPM) {
        return res.status(403).json({
          message: "You are not allowed to upload files for this task",
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (task.attachments.length >= 5) {
        return res.status(400).json({
          message: "Maximum 5 attachments allowed per task",
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
