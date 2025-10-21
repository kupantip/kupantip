import { Request, Response, NextFunction } from 'express';
import {
	getModerationActions,
	ModerationActionFilters,
	TargetType,
	ActionType,
} from '../models/moderationAction.model';
import * as z from 'zod';

const targetTypeEnum = z.enum(['user', 'post', 'comment', 'report']);
const actionTypeEnum = z.enum([
	'ban_create',
	'ban_update',
	'ban_revoke',
	'report_action',
	'delete_content',
]);

const getModerationActionsQuerySchema = z.object({
	actor_id: z.string().uuid().optional(),
	target_type: targetTypeEnum.optional(),
	target_id: z.string().uuid().optional(),
	action_type: actionTypeEnum.optional(),
	start_date: z.string().datetime().optional(),
	end_date: z.string().datetime().optional(),
	recent: z.preprocess((v) => {
		const toBool = (s: string) => {
			const t = s.trim().toLowerCase();
			if (t === 'true' || t === '1') return true;
			if (t === 'false' || t === '0') return false;
			return undefined;
		};
		if (typeof v === 'boolean') return v;
		if (typeof v === 'string') return toBool(v);
		if (Array.isArray(v) && v.length > 0) {
			const last = v[v.length - 1];
			if (typeof last === 'string') return toBool(last);
		}
		return undefined;
	}, z.boolean().optional()),
});

export const getModerationActionsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const parsed = getModerationActionsQuerySchema.parse(req.query);

		const filters: ModerationActionFilters = {
			actor_id: parsed.actor_id,
			target_type: parsed.target_type as TargetType | undefined,
			target_id: parsed.target_id,
			action_type: parsed.action_type as ActionType | undefined,
			start_date: parsed.start_date
				? new Date(parsed.start_date)
				: undefined,
			end_date: parsed.end_date ? new Date(parsed.end_date) : undefined,
			recent: parsed.recent,
		};

		const actions = await getModerationActions(filters);

		return res.status(200).json(actions);
	} catch (err) {
		next(err);
	}
};
