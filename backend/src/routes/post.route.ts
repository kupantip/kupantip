import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createPostController, getPostsController } from '../controller/post.controller';
import { uploadWithLimit } from '../middleware/upload.middleware';

const router = Router();

router.post('/', authMiddleware, uploadWithLimit, createPostController);

router.get('/', getPostsController);

export default router;
