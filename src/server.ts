import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/database";
import authRoutes from "./routes/authRoutes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import projectRoutes from "./routes/projectRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDb();

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get("/", (_req, res) => {
    res.status(200).json({ message: "Task Management API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});