import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { votePostController } from '../controller/postVote.controller';

const router = Router();

router.post('/:post_id', authMiddleware, votePostController);

export default router;
