import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
	voteCommentController,
	deleteVoteCommentController,
} from '../controller/commentVote.controller';

const router = Router();

router.post('/:comment_id', authMiddleware, voteCommentController);
router.delete('/:comment_id', authMiddleware, deleteVoteCommentController);

export default router;
