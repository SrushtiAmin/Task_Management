import { Response } from "express";
import { Types } from "mongoose";
import Task from "../models/Task";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/auth";

const STATUS_FLOW = ["todo", "in_progress", "in_review", "done"];

export class TaskController {

  // CREATE TASK (PM of project only)
  static async createTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const projectId = req.params.projectId;

      const { title, assignedTo, priority, dueDate } = req.body;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // PM must belong to project
      if (
        req.user?.role !== "pm" ||
        !project.members.some(m => m.toString() === userId)
      ) {
        return res.status(403).json({ message: "Only project PM can create tasks" });
      }

      // Assigned user must be project member
      if (!project.members.some(m => m.toString() === assignedTo)) {
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

  // GET TASKS OF A PROJECT
  static async getTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const projectId = req.params.projectId;

      const project = await Project.findById(projectId);
      if (!project || !project.members.some(m => m.toString() === userId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const filter: any = { project: projectId };

      if (req.user?.role !== "pm") {
        filter.assignedTo = new Types.ObjectId(userId);
      }

      if (req.query.status) filter.status = req.query.status;
      if (req.query.priority) filter.priority = req.query.priority;

      const tasks = await Task.find(filter);
      return res.status(200).json(tasks);
    } catch {
      return res.status(500).json({ message: "Failed to fetch tasks" });
    }
  }

  // GET TASK BY ID
  static async getTask(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const project = await Project.findById(task.project);
      const isAssigned = task.assignedTo.toString() === req.user!.userId;
      const isProjectPM =
        req.user?.role === "pm" &&
        project?.members.some(m => m.toString() === req.user!.userId);

      if (!isAssigned && !isProjectPM) {
        return res.status(403).json({ message: "Access denied" });
      }

      return res.status(200).json(task);
    } catch {
      return res.status(500).json({ message: "Failed to fetch task" });
    }
  }

  // UPDATE TASK
  static async updateTask(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const project = await Project.findById(task.project);
      const isAssigned = task.assignedTo.toString() === req.user!.userId;
      const isProjectPM =
        req.user?.role === "pm" &&
        project?.members.some(m => m.toString() === req.user!.userId);

      if (!isAssigned && !isProjectPM) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Member can update only status
      if (!isProjectPM && Object.keys(req.body).some(k => k !== "status")) {
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

  // DELETE TASK (PM only)
  static async deleteTask(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const project = await Project.findById(task.project);
      const isProjectPM =
        req.user?.role === "pm" &&
        project?.members.some(m => m.toString() === req.user!.userId);

      if (!isProjectPM) {
        return res.status(403).json({ message: "Only project PM can delete task" });
      }

      await task.deleteOne();
      return res.status(204).send();
    } catch {
      return res.status(500).json({ message: "Delete failed" });
    }
  }

  // UPDATE STATUS (workflow enforced)
  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const newStatus = req.body.status;
      const currIndex = STATUS_FLOW.indexOf(task.status);
      const newIndex = STATUS_FLOW.indexOf(newStatus);

      const project = await Project.findById(task.project);
      const isAssigned = task.assignedTo.toString() === req.user!.userId;
      const isProjectPM =
        req.user?.role === "pm" &&
        project?.members.some(m => m.toString() === req.user!.userId);

      if (!isAssigned && !isProjectPM) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!isProjectPM && newIndex !== currIndex + 1) {
        return res.status(400).json({ message: "Invalid status flow" });
      }

      task.status = newStatus;
      await task.save();

      return res.status(200).json(task);
    } catch {
      return res.status(500).json({ message: "Failed to update status" });
    }
  }

  // FILE UPLOAD (PM or assigned member)
  static async uploadFile(req: AuthRequest, res: Response) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const project = await Project.findById(task.project);
      const isAssigned = task.assignedTo.toString() === req.user!.userId;
      const isProjectPM =
        req.user?.role === "pm" &&
        project?.members.some(m => m.toString() === req.user!.userId);

      if (!isAssigned && !isProjectPM) {
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
