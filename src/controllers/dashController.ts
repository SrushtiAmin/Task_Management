import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../middleware/auth";
import Project from "../models/Project";
import Task from "../models/Task";

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        statusCode: 401,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const { userId, role } = req.user;
    const today = new Date();

    // ===================== PM DASHBOARD =====================
    if (role === "pm") {
      const projects = await Project.find({
        $or: [
          { createdBy: new Types.ObjectId(userId) },
          { members: new Types.ObjectId(userId) },
        ],
      });

      let completedTasks = 0;
      let pendingTasks = 0;
      let overdueTasks = 0;

      const projectData = await Promise.all(
        projects.map(async (project) => {
          const tasks = await Task.find({ project: project._id }).populate(
            "assignedTo",
            "name email"
          );

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
              assignedTo: task.assignedTo,
            })),
          };
        })
      );

      return res.status(200).json({
        role: "pm",
        stats: {
          completedTasks,
          pendingTasks,
          overdueTasks,
        },
        projects: projectData,
      });
    }

    // ===================== MEMBER DASHBOARD =====================
    const tasks = await Task.find({
      assignedTo: new Types.ObjectId(userId),
    }).populate("project", "name status");

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
      stats: {
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
      tasks: tasks.map((task) => {
        const project = task.project as any;

        return {
          taskId: task._id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          project: {
            projectId: project._id,
            projectName: project.name,
            projectStatus: project.status,
          },
        };
      }),
    });
  } catch (error: any) {
    return res.status(500).json({
      statusCode: 500,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
