import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
	createReportController,
	listReportsController,
	updateReportStatusController,
} from '../controller/report.controller';

const router = Router();

router.get('/', authMiddleware, listReportsController);

router.post('/', authMiddleware, createReportController);

router.patch('/:report_id', authMiddleware, updateReportStatusController);

export default router;
