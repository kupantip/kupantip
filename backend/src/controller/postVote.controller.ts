import { Request, Response } from 'express';
import { upsertPostVote } from '../models/postVote.model';
import * as z from 'zod';

const postVoteSchema = z.object({
	value: z
		.number()
		.int()
		.refine((val) => [-1, 0, 1].includes(val), {
			message: 'Value must be -1, 0, or 1',
		}),
});

export const votePostController = async (req: Request, res: Response) => {
	try {
		const { post_id } = req.params;
		const { value } = req.body; // -1 | 0 | 1
		const user = (req as any).user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });

		const parsed = postVoteSchema.safeParse({ value });
		if (!parsed.success) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: parsed.error.issues.map((i) => ({
					path: i.path.join('.'),
					code: i.code,
					message: i.message,
				})),
			});
		}

		try {
			const result = await upsertPostVote(
				user.user_id,
				post_id,
				parsed.data.value
			);
			return res.status(200).json({
				message:
					result.action === 'insert'
						? 'Vote created'
						: 'Vote updated',
				post_id: result.post_id,
				user_id: result.user_id,
				value: result.value,
				action: result.action,
			});
		} catch (e) {
			if (e instanceof Error && e.message === 'POST_NOT_FOUND') {
				return res.status(404).json({ message: 'Post not found' });
			}
			throw e;
		}
	} catch (err) {
		return res.status(500).json({ message: 'Vote failed', error: err });
	}
};

// export const getMyVoteOnPostController = async (
// 	req: Request,
// 	res: Response
// ) => {
// 	const { post_id } = req.params;
// 	const user = (req as any).user;
// 	if (!user) return res.status(401).json({ message: 'Unauthorized' });

// 	try {
// 		const value = await getUserPostVote(user.user_id, post_id);
// 		return res.status(200).json({ post_id, user_id: user.user_id, value });
// 	} catch (err) {
// 		return res
// 			.status(500)
// 			.json({ message: 'Fetch vote failed', error: err });
// 	}
// };
