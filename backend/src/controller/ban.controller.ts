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
import { logModerationAction } from '../models/moderationAction.model';
import { deletePost } from '../models/post.model';
import { deleteComment } from '../models/comment.model';
import { getDbConnection } from '../database/mssql.database';
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

		// Track content deletion info
		let contentDeleted: { type: 'post' | 'comment'; id: string } | null =
			null;

		// If ban is related to a report, check if we need to delete the reported content
		if (parsed.related_report_id) {
			try {
				const pool = await getDbConnection();
				const reportResult = await pool
					.request()
					.input('report_id', parsed.related_report_id)
					.query(
						`SELECT target_type, target_id FROM [dbo].[report] WHERE id = @report_id`
					);

				if (reportResult.recordset.length > 0) {
					const report = reportResult.recordset[0];
					const { target_type, target_id } = report;

					if (target_type === 'post') {
						// Delete the post (admin delete, no user_id check)
						const deletedPost = await deletePost(target_id);
						if (deletedPost) {
							contentDeleted = { type: 'post', id: target_id };
							// Log the content deletion
							await logModerationAction({
								actor_id: req.user.user_id,
								target_type: 'post',
								target_id: target_id,
								action_type: 'delete_content',
								details: {
									post_title: deletedPost.title,
									author_id: deletedPost.author_id,
									deleted_via_ban: true,
									ban_id: ban.id,
									related_report_id: parsed.related_report_id,
								},
							});
						}
					} else if (target_type === 'comment') {
						// Delete the comment (admin delete, no user_id check)
						const result = await deleteComment(
							target_id,
							undefined,
							'admin'
						);
						if (result.success) {
							contentDeleted = { type: 'comment', id: target_id };
							// Log the content deletion
							await logModerationAction({
								actor_id: req.user.user_id,
								target_type: 'comment',
								target_id: target_id,
								action_type: 'delete_content',
								details: {
									deleted_via_ban: true,
									ban_id: ban.id,
									related_report_id: parsed.related_report_id,
								},
							});
						}
					}
				}
			} catch (error) {
				// Log error but don't fail the ban creation
				console.error(
					'Error deleting content from report:',
					error instanceof Error ? error.message : error
				);
			}
		}

		// Log moderation action
		await logModerationAction({
			actor_id: req.user.user_id,
			target_type: 'user',
			target_id: parsed.user_id,
			action_type: 'ban_create',
			details: {
				ban_id: ban.id,
				ban_type: ban.ban_type,
				reason_admin: ban.reason_admin,
				end_at: ban.end_at,
				related_report_id: parsed.related_report_id,
			},
		});

		const response: {
			message: string;
			ban: typeof ban;
			content_deleted?: { type: 'post' | 'comment'; id: string };
		} = {
			message: contentDeleted
				? `Ban created successfully and reported ${contentDeleted.type} deleted`
				: 'Ban created successfully',
			ban,
		};

		if (contentDeleted) {
			response.content_deleted = contentDeleted;
		}

		return res.status(201).json(response);
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

		// Log moderation action
		await logModerationAction({
			actor_id: req.user.user_id,
			target_type: 'user',
			target_id: updatedBan.user_id,
			action_type: 'ban_update',
			details: {
				ban_id: updatedBan.id,
				updates,
			},
		});

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

		// Log moderation action
		await logModerationAction({
			actor_id: req.user.user_id,
			target_type: 'user',
			target_id: revokedBan.user_id,
			action_type: 'ban_revoke',
			details: {
				ban_id: revokedBan.id,
				reason_admin: parsed.reason_admin,
			},
		});

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
