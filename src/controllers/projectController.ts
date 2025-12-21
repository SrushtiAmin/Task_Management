import { Request, Response } from 'express';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export class ProjectController {
  // CREATE PROJECT (PM only)
  static async createProject(req: AuthRequest, res: Response) {
    try {
      const { name, description, startDate, endDate } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Project name required' });
      }

      const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user!.userId),
        members: [new mongoose.Types.ObjectId(req.user!.userId)],
        startDate,
        endDate,
      });

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create project' });
    }
  }

  // GET ALL PROJECTS
  static async getProjects(req: AuthRequest, res: Response) {
    try {
      const projects = await Project.find({
        members: req.user!.userId,
      }).populate('createdBy', 'name email');

      res.status(200).json(projects);
    } catch {
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  }

  // GET PROJECT BY ID
  static async getProjectById(req: AuthRequest, res: Response) {
    try {
      const project = await Project.findById(req.params.id).populate(
        'members',
        'name email'
      );

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.status(200).json(project);
    } catch {
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  }

  // UPDATE PROJECT (PM only)
  static async updateProject(req: AuthRequest, res: Response) {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.createdBy.toString() !== req.user!.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      Object.assign(project, req.body);
      await project.save();

      res.status(200).json(project);
    } catch {
      res.status(500).json({ message: 'Update failed' });
    }
  }

  // DELETE PROJECT (PM only)
  static async deleteProject(req: AuthRequest, res: Response) {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.createdBy.toString() !== req.user!.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await project.deleteOne();
      res.status(200).json({ message: 'Project deleted' });
    } catch {
      res.status(500).json({ message: 'Delete failed' });
    }
  }

  // ADD MEMBER (PM only)
  static async addMember(req: AuthRequest, res: Response) {
    try {
      const { memberId } = req.body;

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.createdBy.toString() !== req.user!.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (project.members.includes(memberId)) {
        return res.status(400).json({ message: 'Member already added' });
      }

      project.members.push(memberId);
      await project.save();

      res.status(200).json(project);
    } catch {
      res.status(500).json({ message: 'Failed to add member' });
    }
  }
}
