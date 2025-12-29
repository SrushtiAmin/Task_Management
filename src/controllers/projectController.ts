import { Response } from "express";
import mongoose from "mongoose";
import Project from "../models/Project";
import User from "../models/User";
import Task from "../models/Task";
import ActivityLog from "../models/ActivityLog";
import { AuthRequest } from "../middleware/auth";

export class ProjectController {

  // ===================== CREATE PROJECT =====================
  static async createProject(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "pm") {
        return res.status(403).json({
          message: "Only Project Managers can create projects",
        });
      }

      const { name, description, startDate, endDate } = req.body;
      if (!name) {
        return res.status(400).json({
          message: "Project name is required",
        });
      }

      const existingProject = await Project.findOne({ name });
      if (existingProject) {
        return res.status(409).json({
          message: "Project with this name already exists",
        });
      }

      const project = await Project.create({
        name,
        description,
        startDate,
        endDate,
        createdBy: new mongoose.Types.ObjectId(req.user.userId),
        members: [new mongoose.Types.ObjectId(req.user.userId)],
        status: "active",
      });

      return res.status(201).json(project);
    } catch {
      return res.status(500).json({
        message: "Failed to create project",
      });
    }
  }

  // ===================== GET PROJECTS =====================
  static async getProjects(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const projects = await Project.find({
        members: new mongoose.Types.ObjectId(userId),
      }).populate("createdBy", "name email");

      return res.status(200).json(projects);
    } catch {
      return res.status(500).json({
        message: "Failed to fetch projects",
      });
    }
  }

  // ===================== GET PROJECT BY ID =====================
  static async getProjectById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const project = await Project.findById(req.params.id)
        .populate("members", "name email")
        .populate("createdBy", "name email");

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const isAllowed =
        project.createdBy.toString() === userId ||
        project.members.some(m => m._id.toString() === userId);

      if (!isAllowed) {
        return res.status(403).json({
          message: "You do not have access to this project",
        });
      }

      return res.status(200).json(project);
    } catch {
      return res.status(500).json({
        message: "Failed to fetch project",
      });
    }
  }

  // ===================== UPDATE PROJECT (LOGGED) =====================
  static async updateProject(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.createdBy.toString() !== userId) {
        return res.status(403).json({
          message: "Only the project owner can update this project",
        });
      }

      if (project.status === "archived") {
        return res.status(400).json({
          message: "Archived projects cannot be updated",
        });
      }

      const oldStatus = project.status;
      const newStatus = req.body.status;

      Object.assign(project, req.body);
      await project.save();

      if (newStatus && oldStatus !== newStatus) {
        await ActivityLog.create({
          entityType: "project",
          entityId: project._id,
          action: "status_change",
          oldValue: oldStatus,
          newValue: newStatus,
          performedBy: new mongoose.Types.ObjectId(userId),
        });
      }

      return res.status(200).json(project);
    } catch {
      return res.status(500).json({
        message: "Failed to update project",
      });
    }
  }

  // ===================== DELETE PROJECT =====================
  static async deleteProject(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.createdBy.toString() !== userId) {
        return res.status(403).json({
          message: "Only the project owner can delete this project",
        });
      }

      if (project.status !== "archived") {
        return res.status(400).json({
          message: "Only archived projects can be deleted",
        });
      }

      const hasActiveTasks = await Task.exists({
        project: project._id,
        status: { $ne: "done" },
      });

      if (hasActiveTasks) {
        return res.status(400).json({
          message: "Project has active tasks and cannot be deleted",
        });
      }

      await project.deleteOne();
      return res.status(204).send();
    } catch {
      return res.status(500).json({
        message: "Failed to delete project",
      });
    }
  }

  // ===================== ADD MEMBER =====================
  static async addMember(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { memberId } = req.body;

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.createdBy.toString() !== userId) {
        return res.status(403).json({
          message: "You are not authorized to manage this project",
        });
      }

      const userExists = await User.findById(memberId);
      if (!userExists) {
        return res.status(404).json({ message: "User does not exist" });
      }

      if (project.members.some(m => m.toString() === memberId)) {
        return res.status(400).json({
          message: "User is already a member of this project",
        });
      }

      project.members.push(new mongoose.Types.ObjectId(memberId));
      await project.save();

      return res.status(200).json(project);
    } catch {
      return res.status(500).json({
        message: "Failed to add member",
      });
    }
  }

  // ===================== PROJECT DASHBOARD (DB-LEVEL COUNTING) =====================
  static async getProjectDashboard(req: AuthRequest, res: Response) {
    try {
      const { userId, role } = req.user!;
      const { projectId } = req.params;

      const project = await Project.findOne({
        _id: projectId,
        members: new mongoose.Types.ObjectId(userId),
      });

      if (!project) {
        return res.status(403).json({
          message: "You do not have access to this project",
        });
      }

      const match: any = {
        project: new mongoose.Types.ObjectId(projectId),
      };

      if (role !== "pm") {
        match.assignedTo = new mongoose.Types.ObjectId(userId);
      }

      const statsAgg = await Task.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            completedTasks: {
              $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
            },
            pendingTasks: {
              $sum: { $cond: [{ $ne: ["$status", "done"] }, 1, 0] },
            },
            overdueTasks: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$status", "done"] },
                      { $lt: ["$dueDate", new Date()] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      const stats = statsAgg[0] || {
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
      };

      const tasks = await Task.find(match);

      return res.status(200).json({
        role,
        project: {
          projectId: project._id,
          projectName: project.name,
          projectStatus: project.status,
        },
        stats,
        tasks,
      });
    } catch {
      return res.status(500).json({
        message: "Failed to fetch project dashboard",
      });
    }
  }
}
