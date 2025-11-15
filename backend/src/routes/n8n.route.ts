import { Router } from 'express';
import { getAISummaryController } from '../controller/n8n.controller';

const router = Router();

// GET /api/v1/n8n/post/:post_id - Get AI summary for a post
router.get('/post/:post_id', getAISummaryController);

export default router;
