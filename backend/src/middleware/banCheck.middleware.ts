import { Request, Response, NextFunction } from 'express';
import { getUserActiveBans, BanType } from '../models/ban.model';

/**
 * Middleware to check if a user is banned from performing specific actions.
 * Must be used after authMiddleware to ensure req.user is populated.
 *
 * Ban types:
 * - suspend: blocks all actions (post, comment, vote)
 * - post_ban: blocks creating/editing posts
 * - comment_ban: blocks creating/editing comments
 * - vote_ban: blocks voting on posts and comments
 * - shadowban: allows actions but they're hidden from others (not enforced here)
 */
export const checkBan = (action: 'post' | 'comment' | 'vote') => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Skip if no user (should not happen if authMiddleware is used)
			if (!req.user) {
				return res
					.status(401)
					.json({ message: 'Authentication required' });
			}

			// Get all active bans for this user
			const activeBans = await getUserActiveBans(req.user.user_id);

			if (activeBans.length === 0) {
				return next();
			}

			// Check for suspend (blocks everything)
			const suspendBan = activeBans.find((b) => b.ban_type === 'suspend');
			if (suspendBan) {
				return res.status(403).json({
					message: 'Your account has been suspended',
					reason: suspendBan.reason_user || 'No reason provided',
					ban_type: 'suspend',
					end_at: suspendBan.end_at,
				});
			}

			// Check for action-specific bans
			const banTypeMap: Record<string, BanType> = {
				post: 'post_ban',
				comment: 'comment_ban',
				vote: 'vote_ban',
			};

			const relevantBanType = banTypeMap[action];
			const actionBan = activeBans.find(
				(b) => b.ban_type === relevantBanType
			);

			if (actionBan) {
				return res.status(403).json({
					message: `You are banned from ${action} actions`,
					reason: actionBan.reason_user || 'No reason provided',
					ban_type: actionBan.ban_type,
					end_at: actionBan.end_at,
				});
			}

			next();
		} catch (err) {
			next(err);
		}
	};
};

/**
 * Check if user has any active suspend ban (for login/access control)
 */
export const checkSuspend = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			return next();
		}

		const suspendBans = await getUserActiveBans(
			req.user.user_id,
			'suspend'
		);

		if (suspendBans.length > 0) {
			const ban = suspendBans[0];
			return res.status(403).json({
				message: 'Your account is suspended',
				reason: ban.reason_user || 'No reason provided',
				end_at: ban.end_at,
			});
		}

		next();
	} catch (err) {
		next(err);
	}
};
