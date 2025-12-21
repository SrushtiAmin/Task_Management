import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDb from './config/database';
import authRoutes from './routes/authRoutes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import { errorHandler } from './middleware/errorHandler';
import dashboardRoutes from './routes/dashRoutes';
import commentRoutes from './routes/commentRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // required for multer

connectDb();

// serve uploaded files
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'))
);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Task Management API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', commentRoutes);
app.use('/api', dashboardRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
