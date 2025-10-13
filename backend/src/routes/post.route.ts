import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
	createPostController,
	getPostsController,
	deletePostController,
	updatePostController,
} from '../controller/post.controller';
import { uploadWithLimit } from '../middleware/upload.middleware';
import { optionalAuthMiddleware } from '../middleware/optionalAuth.middleware';

const router = Router();

router.post('/', authMiddleware, uploadWithLimit, createPostController);

router.get('/', optionalAuthMiddleware, getPostsController);

router.delete('/:post_id', authMiddleware, deletePostController);

router.put('/:post_id', authMiddleware, uploadWithLimit, updatePostController);

export default router;
