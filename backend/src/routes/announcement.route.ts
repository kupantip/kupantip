import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
	createAnnouncementController,
	getAnnouncementsController,
	getAnnouncementByIdController,
	deleteAnnouncementController,
	getAllAnnouncementsTimelineController,
} from '../controller/announcement.controller';

const router = Router();

router.get('/', getAnnouncementsController);
router.get('/all', authMiddleware, getAllAnnouncementsTimelineController);
router.get('/:announcement_id', getAnnouncementByIdController);
router.post('/', authMiddleware, createAnnouncementController);
router.delete(
	'/:announcement_id',
	authMiddleware,
	deleteAnnouncementController
);

export default router;
