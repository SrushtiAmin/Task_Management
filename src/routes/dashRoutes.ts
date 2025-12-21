import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import { getDashboard } from '../controllers/dashController';

const router = Router();

// Get dashboard data (PM / Member)
router.get('/dashboard', authMiddleware, getDashboard);

export default router;
