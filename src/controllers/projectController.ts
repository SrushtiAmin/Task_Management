import { Response } from "express";
import mongoose from "mongoose";
import Project from "../models/Project";
import User from "../models/User";
import Task from "../models/Task";
import { AuthRequest } from "../middleware/auth";

export class ProjectController {
  /**
   * 1️⃣ CREATE PROJECT
   * PM only
   * Project name must be unique
   */
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

      // Prevent duplicate project names
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
      });

      return res.status(201).json(project);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to create project",
      });
    }
  }

  /**
   * 2️⃣ GET ALL PROJECTS
   * PM & Member → only projects they are part of
   */
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

  /**
   * 3️⃣ GET PROJECT BY ID
   * Only accessible if user is part of the project
   */
  static async getProjectById(req: AuthRequest, res: Response) {
    try {
      const project = await Project.findById(req.params.id).populate(
        "members",
        "name email"
      );

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const isMember = project.members.some(
        (m) => m.toString() === req.user!.userId
      );

      if (!isMember) {
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

  /**
   * 4️⃣ UPDATE PROJECT
   * PM only & PM must be part of project
   */
  static async updateProject(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "pm") {
        return res.status(403).json({
          message: "Only Project Managers can update projects",
        });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const isMember = project.members.some(
        (m) => m.toString() === req.user!.userId
      );

      if (!isMember) {
        return res.status(403).json({
          message: "You are not allowed to update this project",
        });
      }

      Object.assign(project, req.body);
      await project.save();

      return res.status(200).json(project);
    } catch {
      return res.status(500).json({
        message: "Failed to update project",
      });
    }
  }

  /**
   * 5️⃣ DELETE PROJECT
   * PM only
   * PM must be part of project
   * ❌ Cannot delete if active tasks exist
   */
  static async deleteProject(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "pm") {
        return res.status(403).json({
          message: "Only Project Managers can delete projects",
        });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const isMember = project.members.some(
        (m) => m.toString() === req.user!.userId
      );

      if (!isMember) {
        return res.status(403).json({
          message: "You are not allowed to delete this project",
        });
      }

      // 🔒 Block deletion if active tasks exist
      const hasActiveTasks = await Task.exists({
        project: project._id,
        status: { $ne: "done" },
      });

      if (hasActiveTasks) {
        return res.status(400).json({
          message:
            "Project cannot be deleted because it has active (incomplete) tasks",
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

  /**
   * 6️⃣ ADD MEMBER
   * PM only
   * User must exist
   * User must not already be in project
   */
  static async addMember(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "pm") {
        return res.status(403).json({
          message: "Only Project Managers can add members",
        });
      }

      const { memberId } = req.body;

      const userExists = await User.findById(memberId);
      if (!userExists) {
        return res.status(404).json({
          message: "User does not exist",
        });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const alreadyMember = project.members.some(
        (m) => m.toString() === memberId
      );

      if (alreadyMember) {
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
}
