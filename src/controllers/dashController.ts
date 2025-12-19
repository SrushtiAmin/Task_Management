import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../middleware/auth";
import Project from "../models/Project";
import Task from "../models/Task";

export const getDashboard = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { userId, role } = req.user;

        // ===================== PM DASHBOARD =====================
        if (role === "pm") {
            const projects = await Project.find({
                $or: [
                    { createdBy: new Types.ObjectId(userId) },
                    { members: new Types.ObjectId(userId) }
                ]
            });

            const projectData = await Promise.all(
                projects.map(async (project) => {
                    const tasks = await Task.find({ project: project._id })
                        .populate("assignedTo", "name email");

                    return {
                        projectId: project._id,
                        projectName: project.name,
                        projectStatus: project.status,
                        tasks: tasks.map((task) => ({
                            taskId: task._id,
                            title: task.title,
                            status: task.status,
                            priority: task.priority,
                            dueDate: task.dueDate,
                            assignedTo: task.assignedTo
                        }))
                    };
                })
            );

            return res.status(200).json({
                role: "pm",
                projects: projectData
            });
        }

        // ===================== MEMBER DASHBOARD =====================
        const tasks = await Task.find({ assignedTo: userId })
            .populate("project", "name status");

        return res.status(200).json({
            role: "member",
            tasks: tasks.map((task) => {
                const project = task.project as unknown as {
                    _id: Types.ObjectId;
                    name: string;
                    status: "active" | "completed" | "archived";
                };

                return {
                    taskId: task._id,
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    project: {
                        projectId: project._id,
                        projectName: project.name,
                        projectStatus: project.status
                    }
                };
            })
        });

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};
