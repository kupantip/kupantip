import { Router } from 'express';
import * as controller from '../controller/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const router = Router({ strict: true });

router.post('/', authMiddleware, controller.createComment);
router.get('/', controller.getCommentsByPostId);
router.delete('/:comment_id', authMiddleware, controller.deleteComment);
router.put('/:comment_id', authMiddleware, controller.updateComment);

export default router;
