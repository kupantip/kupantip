import { NextFunction, Request, Response } from 'express';
import {
	upsertCommentVote,
	deleteCommentVote,
} from '../models/commentVote.model';
import * as z from 'zod';

const commentVoteSchema = z.object({
	value: z
		.number()
		.int()
		.refine((val) => [-1, 1].includes(val), {
			message: 'Value must be -1 or 1',
		}),
});

export const voteCommentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { comment_id } = req.params;
		const { value } = req.body; // -1 | 1
		const user = (req as any).user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });

		commentVoteSchema.parse({ value });

		const result = await upsertCommentVote(user.user_id, comment_id, value);
		return res.status(200).json({
			message:
				result.action === 'insert' ? 'Vote created' : 'Vote updated',
			comment_id: result.comment_id,
			user_id: result.user_id,
			value: result.value,
			action: result.action,
		});
	} catch (err) {
		next(err);
	}
};

export const deleteVoteCommentController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { comment_id } = req.params;
		const user = (req as any).user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });

		const result = await deleteCommentVote(user.user_id, comment_id);
		return res.status(200).json({
			message: 'Vote deleted',
			comment_id: result.comment_id,
			user_id: result.user_id,
			action: result.action,
		});
	} catch (err) {
		if ((err as Error).message === 'VOTE_NOT_FOUND') {
			return res.status(404).json({ message: 'Vote not found' });
		}
		if ((err as Error).message === 'COMMENT_NOT_FOUND') {
			return res.status(404).json({ message: 'Comment not found' });
		}
		next(err);
	}
};
