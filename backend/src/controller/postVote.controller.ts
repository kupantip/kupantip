import { NextFunction, Request, Response } from 'express';
import { upsertPostVote, deletePostVote } from '../models/postVote.model';
import * as z from 'zod';

const postVoteSchema = z.object({
	value: z
		.number()
		.int()
		.refine((val) => [-1, 1].includes(val), {
			message: 'Value must be -1 or 1',
		}),
});

export const votePostController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { post_id } = req.params;
		const { value } = req.body; // -1 | 1
		const user = req.user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });

		postVoteSchema.parse({ value });

		const result = await upsertPostVote(user.user_id, post_id, value);
		return res.status(200).json({
			message:
				result.action === 'insert' ? 'Vote created' : 'Vote updated',
			post_id: result.post_id,
			user_id: result.user_id,
			value: result.value,
			action: result.action,
		});
	} catch (err) {
		next(err);
	}
};

export const deleteVotePostController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { post_id } = req.params;
		const user = req.user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });

		const result = await deletePostVote(user.user_id, post_id);
		return res.status(200).json({
			message: 'Vote deleted',
			post_id: result.post_id,
			user_id: result.user_id,
			action: result.action,
		});
	} catch (err) {
		if ((err as Error).message === 'VOTE_NOT_FOUND') {
			return res.status(404).json({ message: 'Vote not found' });
		}
		if ((err as Error).message === 'POST_NOT_FOUND') {
			return res.status(404).json({ message: 'Post not found' });
		}
		next(err);
	}
};
