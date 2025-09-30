import { Request, Response } from 'express';
import { upsertPostVote } from '../models/postVote.model';
import * as z from 'zod';

const postVoteSchema = z.object({
	value: z.number().refine((val) => [-1, 1].includes(val), {
		message: 'Value must be -1 or 1',
	}),
});

export const votePostController = async (req: Request, res: Response) => {
	try {
		const { post_id } = req.params;
		const { value } = req.body; // expected -1, 1
		const user = (req as any).user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });

		postVoteSchema.parse(req.body);

		const result = await upsertPostVote(user.user_id, post_id, value);
		return res.status(200).json({
			message: value === 0 ? 'Vote removed' : 'Vote recorded',
			post_id: result.post_id,
			user_id: result.user_id,
			value: result.value,
		});
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
