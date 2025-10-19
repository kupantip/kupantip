import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
	votePostController,
	deleteVotePostController,
} from '../controller/postVote.controller';
import { checkBan } from '../middleware/banCheck.middleware';

const router = Router();

router.post('/:post_id', authMiddleware, checkBan('vote'), votePostController);
router.delete('/:post_id', authMiddleware, checkBan('vote'), deleteVotePostController);

export default router;
