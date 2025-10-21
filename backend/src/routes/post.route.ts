import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
	createPostController,
	getPostsController,
	deletePostController,
	updatePostController,
	getHotPostsController,
	getPostSummaryStatsController,
} from '../controller/post.controller';
import { uploadWithLimit } from '../middleware/upload.middleware';
import { optionalAuthMiddleware } from '../middleware/optionalAuth.middleware';
import { checkBan } from '../middleware/banCheck.middleware';

const router = Router();

router.post(
	'/',
	authMiddleware,
	checkBan('post'),
	uploadWithLimit,
	createPostController
);

router.get('/', optionalAuthMiddleware, getPostsController);

router.get('/hot', optionalAuthMiddleware, getHotPostsController);

router.get('/summarystats', getPostSummaryStatsController);

router.delete('/:post_id', authMiddleware, deletePostController);

router.put(
	'/:post_id',
	authMiddleware,
	checkBan('post'),
	uploadWithLimit,
	updatePostController
);

router.get('/attachments/:filename', (req, res) => {
	const filename = req.params.filename;
	const options = {
		root: 'uploads/',
	};

	res.sendFile(filename, options, (err) => {
		if (err) {
			res.status(404).send('File not found');
		}
	});
});

export default router;
