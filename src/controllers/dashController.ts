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

      const projectIds = projects.map((p) => p._id);

      // ---------- AGGREGATED TASK STATS ----------
      const statsAgg = await Task.aggregate([
        { $match: { project: { $in: projectIds } } },
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
                      { $lt: ["$dueDate", today] },
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

      // ---------- PROJECT-WISE TASKS ----------
      const tasksByProject = await Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedTo",
          },
        },
        { $unwind: "$assignedTo" },
        {
          $group: {
            _id: "$project",
            tasks: {
              $push: {
                taskId: "$_id",
                title: "$title",
                status: "$status",
                priority: "$priority",
                dueDate: "$dueDate",
                assignedTo: {
                  _id: "$assignedTo._id",
                  name: "$assignedTo.name",
                  email: "$assignedTo.email",
                },
              },
            },
          },
        },
      ]);

      const projectData = projects.map((project) => {
        const taskGroup = tasksByProject.find(
          (t) => t._id.toString() === project._id.toString()
        );

        return {
          projectId: project._id,
          projectName: project.name,
          projectStatus: project.status,
          tasks: taskGroup ? taskGroup.tasks : [],
        };
      });

      return res.status(200).json({
        role: "pm",
        stats,
        projects: projectData,
      });
    }

    // ===================== MEMBER DASHBOARD =====================
    const taskAgg = await Task.aggregate([
      {
        $match: {
          assignedTo: new Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
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
                    { $lt: ["$dueDate", today] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          tasks: {
            $push: {
              taskId: "$_id",
              title: "$title",
              status: "$status",
              priority: "$priority",
              dueDate: "$dueDate",
              project: {
                projectId: "$project._id",
                projectName: "$project.name",
                projectStatus: "$project.status",
              },
            },
          },
        },
      },
    ]);

    const result = taskAgg[0] || {
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      tasks: [],
    };

    return res.status(200).json({
      role: "member",
      stats: {
        completedTasks: result.completedTasks,
        pendingTasks: result.pendingTasks,
        overdueTasks: result.overdueTasks,
      },
      tasks: result.tasks,
    });
  } catch (error: any) {
    return res.status(500).json({
      statusCode: 500,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
