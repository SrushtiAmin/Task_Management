import { Response } from "express";
import mongoose from "mongoose";
import Comment from "../models/Comments";
import Task from "../models/Task";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/auth";

export class CommentController {

  // ===================== ADD COMMENT =====================
  static async addComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Comment content required" });
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // ---------- MEMBER ACCESS ----------
      if (req.user.role !== "pm") {
        if (task.assignedTo.toString() !== req.user.userId) {
          return res.status(403).json({
            message: "You can comment only on your assigned task",
          });
        }
      }

      // ---------- PM ACCESS (DB-side) ----------
      if (req.user.role === "pm") {
        const hasAccess = await Project.exists({
          _id: task.project,
          members: req.user.userId,
        });

        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const comment = await Comment.create({
        task: task._id,
        user: new mongoose.Types.ObjectId(req.user.userId),
        content,
      });

      return res.status(201).json(comment);
    } catch {
      return res.status(500).json({ message: "Failed to add comment" });
    }
  }

  // ===================== GET COMMENTS =====================
  static async getComments(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // ---------- MEMBER ACCESS ----------
      if (req.user.role !== "pm") {
        if (task.assignedTo.toString() !== req.user.userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      // ---------- PM ACCESS (DB-side) ----------
      if (req.user.role === "pm") {
        const hasAccess = await Project.exists({
          _id: task.project,
          members: req.user.userId,
        });

        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const comments = await Comment.find({ task: task._id })
        .populate("user", "name email role")
        .sort({ createdAt: -1 });

      return res.status(200).json(comments);
    } catch {
      return res.status(500).json({ message: "Failed to fetch comments" });
    }
  }

  // ===================== DELETE COMMENT =====================
  static async deleteComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const task = await Task.findById(comment.task);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // ---------- MEMBER RULE ----------
      if (req.user.role !== "pm") {
        if (
          comment.user.toString() !== req.user.userId ||
          task.assignedTo.toString() !== req.user.userId
        ) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      // ---------- PM RULE (DB-side) ----------
      if (req.user.role === "pm") {
        const hasAccess = await Project.exists({
          _id: task.project,
          members: req.user.userId,
        });

        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      await comment.deleteOne();
      return res.status(204).send();
    } catch {
      return res.status(500).json({ message: "Delete failed" });
    }
  }
}
