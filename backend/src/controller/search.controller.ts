import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { search } from '../models/search.model';

const searchSchema = z.object({
	query: z.string().min(1, 'Search query is required'),
	type: z.enum(['post', 'comment', 'user', 'all']).default('all'),
	limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const searchController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { query, type, limit } = searchSchema.parse(req.query);

		// Get user ID from auth middleware if authenticated
		const requesting_user_id = req.user?.user_id;

		const results = await search(query, type, limit, requesting_user_id);

		return res.status(200).json(results);
	} catch (err) {
		next(err);
	}
};
