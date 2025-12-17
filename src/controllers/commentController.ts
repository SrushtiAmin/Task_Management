import { Response } from "express";
import Comment from "../models/Comments";
import { AuthRequest } from "../middleware/auth";
import mongoose from "mongoose";

export class CommentController {

  // POST /api/tasks/:id/comments
  static async addComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.body.content) {
        return res.status(400).json({ message: "Comment content required" });
      }

      const comment = await Comment.create({
        task: new mongoose.Types.ObjectId(req.params.id),
        user: new mongoose.Types.ObjectId(req.user.userId),
        content: req.body.content,
      });

      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to add comment" });
    }
  }

  // GET /api/tasks/:id/comments
  static async getComments(req: AuthRequest, res: Response) {
    try {
      const comments = await Comment.find({
        task: req.params.id,
      }).populate("user", "name email");

      res.json(comments);
    } catch {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  }

  // DELETE /api/comments/:id
  static async deleteComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (comment.user.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await comment.deleteOne();
      res.json({ message: "Comment deleted" });
    } catch {
      res.status(500).json({ message: "Delete failed" });
    }
  }
}
