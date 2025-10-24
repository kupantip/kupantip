import { Request, Response, NextFunction } from 'express';
import {
	getAllDashboardStats,
	getUserStats,
	getPostStats,
	getCommentStats,
	getReportStats,
	getDailyPostActivity,
	getDailyReportActivity,
} from '../models/stats.model';
import * as z from 'zod';

const dailyActivitySchema = z.object({
	days: z.coerce.number().int().min(1).max(90).optional(),
});

export const getDashboardStatsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const stats = await getAllDashboardStats();

		return res.status(200).json(stats);
	} catch (err) {
		next(err);
	}
};

export const getUserStatsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const stats = await getUserStats();

		return res.status(200).json(stats);
	} catch (err) {
		next(err);
	}
};

export const getPostStatsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const stats = await getPostStats();

		return res.status(200).json(stats);
	} catch (err) {
		next(err);
	}
};

export const getCommentStatsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const stats = await getCommentStats();

		return res.status(200).json(stats);
	} catch (err) {
		next(err);
	}
};

export const getReportStatsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const stats = await getReportStats();

		return res.status(200).json(stats);
	} catch (err) {
		next(err);
	}
};

export const getDailyPostActivityController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const parsed = dailyActivitySchema.parse(req.query);
		const days = parsed.days ?? 7; // Default to 7 days

		const activity = await getDailyPostActivity(days);

		return res.status(200).json(activity);
	} catch (err) {
		next(err);
	}
};

export const getDailyReportActivityController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}

		const parsed = dailyActivitySchema.parse(req.query);
		const days = parsed.days ?? 7; // Default to 7 days

		const activity = await getDailyReportActivity(days);

		return res.status(200).json(activity);
	} catch (err) {
		next(err);
	}
};
