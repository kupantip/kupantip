import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
	createBanController,
	getBansController,
	updateBanController,
	revokeBanController,
	getUserBanStatusController,
} from '../controller/ban.controller';

const router = Router();

// Admin routes - manage bans
router.post('/', authMiddleware, createBanController);
router.get('/', authMiddleware, getBansController);
router.patch('/:ban_id', authMiddleware, updateBanController);
router.patch('/revoke/:ban_id', authMiddleware, revokeBanController);

// Public route - check user ban status
router.get('/user/status/:user_id', getUserBanStatusController);

export default router;
