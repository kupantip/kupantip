import { Router } from 'express';
import * as controller from '../controller/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkBan } from '../middleware/banCheck.middleware';
const router = Router({ strict: true });

router.post('/', authMiddleware, checkBan('comment'), controller.createComment);
router.get('/', controller.getCommentsByPostId);
router.delete('/:comment_id', authMiddleware, controller.deleteComment);
router.put('/:comment_id', authMiddleware, checkBan('comment'), controller.updateComment);

export default router;
