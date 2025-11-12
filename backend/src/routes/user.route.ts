import { Router } from 'express';
import {
	signupController,
	loginController,
	forgetPasswordController,
	verifyTokenController,
	resetPasswordController,
} from '../controller/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkSuspend } from '../middleware/banCheck.middleware';

const router = Router({ strict: true });

router.get('/', (req, res) => {
	res.send('user route');
});

router.get('/profile', authMiddleware, checkSuspend, (req, res) => {
	res.json({ user: req.user });
});

// POST /login สำหรับ auth
router.post('/login', loginController);

router.post('/signup', signupController);

router.post('/forget', forgetPasswordController);

router.put('/reset/:rt_id', resetPasswordController);
router.get('/reset/verify/:token', verifyTokenController);

export default router;
