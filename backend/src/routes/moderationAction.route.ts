import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getModerationActionsController } from '../controller/moderationAction.controller';

const router = Router();

// All routes require admin authentication
router.use(authMiddleware);

// GET /api/v1/moderation-actions - list all with optional filters via query params
// Supports: ?actor_id=uuid&target_type=user&target_id=uuid&action_type=ban_create&start_date=...&end_date=...
router.get('/', getModerationActionsController);

export default router;
