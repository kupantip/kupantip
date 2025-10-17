import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
	createReportController,
	listReportsController,
	updateReportStatusController,
	getReportsSummaryController,
} from '../controller/report.controller';

const router = Router();

router.get('/', authMiddleware, listReportsController);

router.get('/summary', authMiddleware, getReportsSummaryController);

router.post('/', authMiddleware, createReportController);

router.patch('/:report_id', authMiddleware, updateReportStatusController);

export default router;
