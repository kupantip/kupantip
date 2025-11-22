import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/express/index.t';

export const optionalAuthMiddleware = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	const token = req.header('Authorization')?.replace('Bearer ', '');
	if (!token) return next();
	try {
		const decoded = jwt.verify(token, String(env.jwtSecret)) as JwtPayload;
		req.user = decoded;
	} catch {
		// Ignore invalid token; proceed as anonymous
	}
	next();
};
