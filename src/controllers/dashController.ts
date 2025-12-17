import { Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "../middleware/auth";

export class DashboardController {
  static async getStats(req: AuthRequest, res: Response) {
    const tasks = await Task.find({ assignedTo: req.user!.userId });
    res.json({
      total: tasks.length,
      todo: tasks.filter(t => t.status === "todo").length,
      done: tasks.filter(t => t.status === "done").length,
    });
  }
}
