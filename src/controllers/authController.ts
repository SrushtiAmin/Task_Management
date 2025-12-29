import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/User";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      const jwtExpire = process.env.JWT_EXPIRE || "7d";

      if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined");
      }

      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      const token = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        jwtSecret,
        { expiresIn: jwtExpire } as SignOptions
      );

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      return res.status(500).json({
        message: "Registration failed",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      const jwtExpire = process.env.JWT_EXPIRE || "7d";

      if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined");
      }

      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        jwtSecret,
        { expiresIn: jwtExpire } as SignOptions
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return res.status(500).json({
        message: "Login failed",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("GET CURRENT USER ERROR:", error);
      return res.status(500).json({
        message: "Failed to fetch current user",
      });
    }
  }
}
