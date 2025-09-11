import { Router } from 'express';
import * as controller from '../controller/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const router = Router({ strict: true });

router.post('/', authMiddleware, controller.createComment);
router.get('/', controller.getCommentsByPostId);

export default router;
