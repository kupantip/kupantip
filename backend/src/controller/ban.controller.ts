import { Request, Response, NextFunction } from 'express';
import {
	createBan,
	getBans,
	updateBan,
	revokeBan,
	getUserActiveBans,
	BanType,
	BanFilters,
} from '../models/ban.model';
import * as z from 'zod';

const banTypeEnum = z.enum([
	'suspend',
	'post_ban',
	'comment_ban',
	'vote_ban',
	'shadowban',
]);

const createBanSchema = z.object({
	user_id: z.string().uuid(),
	ban_type: banTypeEnum,
	reason_admin: z.string().optional(),
	reason_user: z.string().max(512).optional(),
	end_at: z.string().datetime().nullable().optional(),
	related_report_id: z.string().uuid().optional(),
});

const updateBanSchema = z.object({
	ban_type: banTypeEnum.optional(),
	reason_admin: z.string().optional(),
	reason_user: z.string().max(512).optional(),
	end_at: z.string().datetime().nullable().optional(),
});

const revokeBanSchema = z.object({
	reason_admin: z.string().optional(),
});

const getBansQuerySchema = z.object({
	ban_id: z.string().uuid().optional(),
	user_id: z.string().uuid().optional(),
	ban_type: banTypeEnum.optional(),
	status: z.enum(['active', 'scheduled', 'expired', 'revoked']).optional(),
	created_by: z.string().uuid().optional(),
	related_report_id: z.string().uuid().optional(),
	start_date: z.string().datetime().optional(),
	end_date: z.string().datetime().optional(),
});

const banIdParamSchema = z.object({
	ban_id: z.string().uuid(),
});

const userIdParamSchema = z.object({
	user_id: z.string().uuid(),
});

export const createBanController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = createBanSchema.parse(req.body);

		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		// Check if user is already actively banned with the same type
		const existingBans = await getUserActiveBans(
			parsed.user_id,
			parsed.ban_type as BanType
		);

		if (existingBans.length > 0) {
			return res.status(400).json({
				message: 'User already has an active ban of this type',
				existing_bans: existingBans,
			});
		}

		const ban = await createBan({
			user_id: parsed.user_id,
			ban_type: parsed.ban_type as BanType,
			reason_admin: parsed.reason_admin,
			reason_user: parsed.reason_user,
			end_at: parsed.end_at ? new Date(parsed.end_at) : null,
			created_by: req.user.user_id,
			related_report_id: parsed.related_report_id,
		});

		return res.status(201).json({
			message: 'Ban created successfully',
			ban,
		});
	} catch (err) {
		next(err);
	}
};

export const getBansController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = getBansQuerySchema.parse(req.query);

		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const filters: BanFilters = {
			ban_id: parsed.ban_id,
			user_id: parsed.user_id,
			ban_type: parsed.ban_type as BanType | undefined,
			status: parsed.status,
			created_by: parsed.created_by,
			related_report_id: parsed.related_report_id,
			start_date: parsed.start_date
				? new Date(parsed.start_date)
				: undefined,
			end_date: parsed.end_date ? new Date(parsed.end_date) : undefined,
		};

		const bans = await getBans(filters);

		// If ban_id is provided and exactly one result, return single object
		if (parsed.ban_id && bans.length === 1) {
			return res.status(200).json(bans[0]);
		}

		// If ban_id is provided but not found
		if (parsed.ban_id && bans.length === 0) {
			return res.status(404).json({ message: 'Ban not found' });
		}

		// Otherwise return array
		return res.status(200).json(bans);
	} catch (err) {
		next(err);
	}
};

export const updateBanController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		banIdParamSchema.parse(req.params);
		const parsed = updateBanSchema.parse(req.body);

		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const { ban_id } = req.params;

		const updates = {
			...(parsed.ban_type && { ban_type: parsed.ban_type as BanType }),
			...(parsed.reason_admin !== undefined && {
				reason_admin: parsed.reason_admin,
			}),
			...(parsed.reason_user !== undefined && {
				reason_user: parsed.reason_user,
			}),
			...(parsed.end_at !== undefined && {
				end_at: parsed.end_at ? new Date(parsed.end_at) : null,
			}),
		};

		const updatedBan = await updateBan(ban_id, updates);

		if (!updatedBan) {
			return res
				.status(404)
				.json({ message: 'Ban not found or already revoked' });
		}

		return res.status(200).json({
			message: 'Ban updated successfully',
			ban: updatedBan,
		});
	} catch (err) {
		next(err);
	}
};

export const revokeBanController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		banIdParamSchema.parse(req.params);
		const parsed = revokeBanSchema.parse(req.body);

		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const { ban_id } = req.params;

		const revokedBan = await revokeBan(
			ban_id,
			req.user.user_id,
			parsed.reason_admin
		);

		if (!revokedBan) {
			return res
				.status(404)
				.json({ message: 'Ban not found or already revoked' });
		}

		return res.status(200).json({
			message: 'Ban revoked successfully',
			ban: revokedBan,
		});
	} catch (err) {
		next(err);
	}
};

export const getUserBanStatusController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		userIdParamSchema.parse(req.params);

		const { user_id } = req.params;
		const activeBans = await getUserActiveBans(user_id);

		const is_banned = activeBans.length > 0;

		// Format response with user-visible fields only
		const bans_info = activeBans.map((ban) => ({
			ban_type: ban.ban_type,
			reason_user: ban.reason_user,
			start_at: ban.start_at,
			end_at: ban.end_at,
		}));

		return res.status(200).json({
			is_banned,
			active_bans: bans_info,
		});
	} catch (err) {
		next(err);
	}
};
