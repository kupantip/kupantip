import { Router } from 'express';
import {
	signupController,
	loginController,
} from '../controller/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router({ strict: true });

router.get('/', (req, res) => {
	res.send('user route');
});

router.get('/profile', authMiddleware, (req, res) => {
	res.json({ user: req.user });
});

// POST /login สำหรับ auth
router.post('/login', loginController);

router.post('/signup', signupController);

export default router;
