import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies.token;
	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}
	try {
		const decoded = jwt.verify(token, String(env.jwtSecret));
		// เพิ่มข้อมูล user ลง req เช่น req.user = decoded;
		req.user = decoded;
		next();
	} catch (err) {
		return res
			.status(401)
			.json({ message: 'Invalid token', error: (err as Error).message });
	}
};
