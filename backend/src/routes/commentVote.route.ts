import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
	voteCommentController,
	deleteVoteCommentController,
} from '../controller/commentVote.controller';
import { checkBan } from '../middleware/banCheck.middleware';

const router = Router();

router.post(
	'/:comment_id',
	authMiddleware,
	checkBan('vote'),
	voteCommentController
);
router.delete(
	'/:comment_id',
	authMiddleware,
	checkBan('vote'),
	deleteVoteCommentController
);

export default router;
