import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import User from "../models/User";

export class AuthController {

    static async register(req: Request, res: Response) {
        try {
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

            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            res.status(500).json({ message: "Registration failed" });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password required" });
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
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET as string,
                { expiresIn:"7d"}
            );

            res.status(200).json({ token });
        } catch {
            res.status(500).json({ message: "Login failed" });
        }
    }

    // New method: Get current logged-in user
    static async getCurrentUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const user = await User.findById(userId).select("-password");
            if (!user) return res.status(404).json({ message: "User not found" });

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch user" });
        }
    }
}
