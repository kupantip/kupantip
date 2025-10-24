import { Router } from 'express';
import {
	getDashboardStatsController,
	getUserStatsController,
	getPostStatsController,
	getCommentStatsController,
	getReportStatsController,
	getDailyPostActivityController,
	getDailyReportActivityController,
} from '../controller/stats.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all dashboard stats
router.get('/', getDashboardStatsController);

// Get individual stats
router.get('/users', getUserStatsController);
router.get('/posts', getPostStatsController);
router.get('/comments', getCommentStatsController);
router.get('/reports', getReportStatsController);

// Get daily post activity for charts
router.get('/daily-post-activity', getDailyPostActivityController);
router.get('/daily-report-activity', getDailyReportActivityController);

export default router;
