import { Router } from 'express';
import {
	getUserProfileController,
	getMyProfileController,
	upsertUserProfileController,
} from '../controller/userProfile.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET /profile/me - Get current user's profile (requires auth)
router.get('/me', authMiddleware, getMyProfileController);

// PUT /profile/me - Update current user's profile (requires auth)
router.put('/me', authMiddleware, upsertUserProfileController);

// GET /profile/:user_id - Get any user's profile (public)
router.get('/:user_id', getUserProfileController);

export default router;
