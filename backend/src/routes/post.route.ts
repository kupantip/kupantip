import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createPostController, getPostsController } from '../controller/post.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// รองรับทั้ง text + file
router.post('/', authMiddleware, upload.single('file'), createPostController);

router.get('/', getPostsController);

export default router;
