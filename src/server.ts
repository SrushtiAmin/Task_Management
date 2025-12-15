import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/database";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

// Core middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDb();

// Database Connection
app.get("/", (_req, res) => {
    res.status(200).json({ message: "Task Management API is running" });
});
// Auth routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
