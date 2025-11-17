import { Request, Response, NextFunction } from 'express';
import { getUserProfile, upsertUserProfile } from '../models/userProfile.model';
import * as z from 'zod';

const userProfileSchema = z.object({
	bio: z.string().max(500).optional().nullable(),
	interests: z.string().optional().nullable(),
	skills: z.string().optional().nullable(),
});

const userIdSchema = z.object({
	user_id: z.string().uuid('Invalid user_id format'),
});

export const getUserProfileController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user_id } = userIdSchema.parse(req.params);

		const profile = await getUserProfile(user_id);

		if (!profile) {
			return res.status(404).json({ message: 'User profile not found' });
		}

		return res.status(200).json(profile);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(404).json({ message: 'User profile not found' });
		}
		next(err);
	}
};

export const getMyProfileController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const profile = await getUserProfile(req.user.user_id);

		if (!profile) {
			return res.status(200).json({
				user_id: req.user.user_id,
				bio: null,
				interests: null,
				skills: null,
			});
		}

		return res.status(200).json(profile);
	} catch (err) {
		next(err);
	}
};

export const upsertUserProfileController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const validatedData = userProfileSchema.parse(req.body);
		const { bio, interests, skills } = validatedData;

		const profile = await upsertUserProfile(
			req.user.user_id,
			bio ?? null,
			interests ?? null,
			skills ?? null
		);

		return res.status(200).json({
			message: 'Profile updated successfully',
			profile,
		});
	} catch (err) {
		next(err);
	}
};
