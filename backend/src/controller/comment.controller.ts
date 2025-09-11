import * as models from '../models/comment.model';
import { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
import * as t from '../types/comment.t';

const createCommentSchema = z.object({
	post_id: z.string(),
	body_md: z.string(),
	parent_id: z.string().nullable(),
});

export const createComment = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { post_id } = req.query;
		const { body_md, parent_id } = req.body;

		const data: t.CommentReq = {
			post_id,
			body_md,
			author_id: req.user.user_id,
			parent_id: parent_id || null,
		};

		console.log(data);

		createCommentSchema.parse(data);

		const comment = await models.create_comment(data);

		if (comment) {
			res.json({ message: 'Comment success', comment });
			return;
		}
		throw new Error('Something went wrong!!');
	} catch (error) {
		next(error);
	}
};
