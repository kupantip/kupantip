import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
	votePostController,
	deleteVotePostController,
} from '../controller/postVote.controller';

const router = Router();

router.post('/:post_id', authMiddleware, votePostController);
router.delete('/:post_id', authMiddleware, deleteVotePostController);

export default router;
