// import * as models from '../models/init.models';
import { Request, Response, NextFunction } from 'express';
import * as z from 'zod';

const get_post = z.object({
	category_id: z.string(),
});

const init = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { category_id } = req.query;
		get_post.parse({ category_id });
		res.json({ massage: 'Request OK' });
	} catch (error) {
		// other unexpected errors
		next(error);
	}
};

export { init };
