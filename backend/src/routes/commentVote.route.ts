import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { voteCommentController } from '../controller/commentVote.controller';

const router = Router();

router.post('/:comment_id', authMiddleware, voteCommentController);

export default router;
