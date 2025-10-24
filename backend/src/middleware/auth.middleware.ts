import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/express/index.t';

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token =
		req.cookies.token ||
		req.header('Authorization')?.replace('Bearer ', '');
	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}
	try {
		const decoded = jwt.verify(token, String(env.jwtSecret)) as JwtPayload;
		req.user = decoded;
		next();
	} catch (err) {
		return res
			.status(401)
			.json({ message: 'Invalid token', error: (err as Error).message });
	}
};
