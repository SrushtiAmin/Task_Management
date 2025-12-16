import { Request, Response } from "express";
import { Project } from "../models/Project";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

export class ProjectController {

    // CREATE PROJECT (PM only)
    static async createProject(req: AuthRequest, res: Response) {
        try {
            if (req.user?.role !== "pm") {
                return res.status(403).json({ message: "Only PM can create projects" });
            }

            const { name, description, startDate, endDate } = req.body;

            if (!name) {
                return res.status(400).json({ message: "Project name is required" });
            }

            const project = await Project.create({
                name,
                description,
                createdBy: req.user.userId,
                members: [req.user.userId],
                status: "active",
                startDate,
                endDate,
            });

            res.status(201).json(project);
        } catch (error) {
            res.status(500).json({ message: "Failed to create project" });
        }
    }

    // GET ALL PROJECTS (PM sees own, member sees assigned)
    static async getProjects(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;

            const projects = await Project.find({
                members: userId,
            }).populate("createdBy members", "name email role");

            res.status(200).json(projects);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch projects" });
        }
    }

    // GET PROJECT BY ID
    static async getProjectById(req: AuthRequest, res: Response) {
        try {
            const project = await Project.findById(req.params.id)
                .populate("createdBy members", "name email role");

            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            if (!project.members.some(m => m.toString() === req.user?.userId)) {
                return res.status(403).json({ message: "Access denied" });
            }

            res.status(200).json(project);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch project" });
        }
    }

    // UPDATE PROJECT (PM only)
    static async updateProject(req: AuthRequest, res: Response) {
        try {
            const project = await Project.findById(req.params.id);

            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            if (project.createdBy.toString() !== req.user?.userId) {
                return res.status(403).json({ message: "Only PM can update project" });
            }

            Object.assign(project, req.body);
            await project.save();

            res.status(200).json(project);
        } catch (error) {
            res.status(500).json({ message: "Failed to update project" });
        }
    }

    // DELETE PROJECT (PM only)
    static async deleteProject(req: AuthRequest, res: Response) {
        try {
            const project = await Project.findById(req.params.id);

            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            if (project.createdBy.toString() !== req.user?.userId) {
                return res.status(403).json({ message: "Only PM can delete project" });
            }

            await project.deleteOne();
            res.status(200).json({ message: "Project deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Failed to delete project" });
        }
    }

    // ADD MEMBER TO PROJECT (PM only)
    static async addMember(req: AuthRequest, res: Response) {
        try {
            const { memberId } = req.body;

            const project = await Project.findById(req.params.id);
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            if (project.createdBy.toString() !== req.user?.userId) {
                return res.status(403).json({ message: "Only PM can add members" });
            }

            const user = await User.findById(memberId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (project.members.includes(user._id)) {
                return res.status(400).json({ message: "User already a member" });
            }

            project.members.push(user._id);
            await project.save();

            res.status(200).json({ message: "Member added successfully", project });
        } catch (error) {
            res.status(500).json({ message: "Failed to add member" });
        }
    }
}
