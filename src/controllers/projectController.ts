import { Response } from "express";
import mongoose from "mongoose";
import Project from "../models/Project";
import User from "../models/User";
import Task from "../models/Task";
import { AuthRequest } from "../middleware/auth";

export class ProjectController {
  /* ===================== EXISTING CODE (UNCHANGED) ===================== */

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
      return res.status(500).json({ message: "Failed to create project" });
    }
  }

  static async getProjects(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const projects = await Project.find({
        members: new mongoose.Types.ObjectId(userId),
      }).populate("createdBy", "name email");

      return res.status(200).json(projects);
    } catch {
      return res.status(500).json({ message: "Failed to fetch projects" });
    }
  }

  static async getProjectById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const project = await Project.findById(req.params.id)
        .populate("members", "name email")
        .populate("createdBy", "name email");

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const isAllowed =
        project.createdBy.toString() === userId ||
        project.members.some((m) => m._id.toString() === userId);

      if (!isAllowed) {
        return res.status(403).json({
          message: "You do not have access to this project",
        });
      }

      return res.status(200).json(project);
    } catch {
      return res.status(500).json({ message: "Failed to fetch project" });
    }
  }

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

      Object.assign(project, req.body);
      await project.save();

      return res.status(200).json(project);
    } catch {
      return res.status(500).json({ message: "Failed to update project" });
    }
  }

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
      return res.status(500).json({ message: "Failed to delete project" });
    }
  }

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

      if (project.members.some((m) => m.toString() === memberId)) {
        return res.status(400).json({
          message: "User is already a member of this project",
        });
      }

      project.members.push(new mongoose.Types.ObjectId(memberId));
      await project.save();

      return res.status(200).json(project);
    } catch {
      return res.status(500).json({ message: "Failed to add member" });
    }
  }

  /* ===================== PROJECT DASHBOARD (ADDED) ===================== */

  static async getProjectDashboard(req: AuthRequest, res: Response) {
    try {
      const { userId, role } = req.user!;
      const { projectId } = req.params;
      const { memberId, taskId } = req.query;
      const today = new Date();

      const project = await Project.findOne({
        _id: projectId,
        members: new mongoose.Types.ObjectId(userId),
      });

      if (!project) {
        return res.status(403).json({
          message: "You do not have access to this project",
        });
      }

      // ===================== PM DASHBOARD =====================
      if (role === "pm") {
        const filter: any = {
          project: new mongoose.Types.ObjectId(projectId),
        };

        // memberId filter (PM only)
        if (memberId) {
          if (!project.members.some((m) => m.toString() === memberId)) {
            return res.status(400).json({
              message: "Member does not belong to this project",
            });
          }
          filter.assignedTo = new mongoose.Types.ObjectId(memberId as string);
        }

        // taskId filter (PM only)
        if (taskId) {
          filter._id = new mongoose.Types.ObjectId(taskId as string);
        }

        const tasks = await Task.find(filter).populate(
          "assignedTo",
          "name email"
        );

        let completedTasks = 0;
        let pendingTasks = 0;
        let overdueTasks = 0;

        tasks.forEach((task) => {
          if (task.status === "done") {
            completedTasks++;
          } else {
            pendingTasks++;
            if (task.dueDate && new Date(task.dueDate) < today) {
              overdueTasks++;
            }
          }
        });

        return res.status(200).json({
          role: "pm",
          project: {
            projectId: project._id,
            projectName: project.name,
            projectStatus: project.status,
          },
          stats: { completedTasks, pendingTasks, overdueTasks },
          tasks,
        });
      }

      // ===================== MEMBER DASHBOARD =====================
      const filter: any = {
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: new mongoose.Types.ObjectId(userId),
      };

      // taskId filter (member – only own task)
      if (taskId) {
        filter._id = new mongoose.Types.ObjectId(taskId as string);
      }

      const tasks = await Task.find(filter);

      let completedTasks = 0;
      let pendingTasks = 0;
      let overdueTasks = 0;

      tasks.forEach((task) => {
        if (task.status === "done") {
          completedTasks++;
        } else {
          pendingTasks++;
          if (task.dueDate && new Date(task.dueDate) < today) {
            overdueTasks++;
          }
        }
      });

      return res.status(200).json({
        role: "member",
        project: {
          projectId: project._id,
          projectName: project.name,
          projectStatus: project.status,
        },
        stats: { completedTasks, pendingTasks, overdueTasks },
        tasks,
      });
    } catch {
      return res.status(500).json({
        message: "Failed to fetch project dashboard",
      });
    }
  }
}
