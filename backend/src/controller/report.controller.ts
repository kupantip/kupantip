import { NextFunction, Request, Response } from 'express';
import {
	createReport,
	listReports,
	ReportStatus,
	ReportTarget,
	updateReportStatus,
} from '../models/report.model';
import * as z from 'zod';

const createSchema = z.object({
	target_type: z
		.string()
		.refine((val) => ['post', 'comment', 'user'].includes(val)),
	target_id: z.string().uuid(),
	reason: z.string().min(1).max(1000),
});

const listSchema = z.object({
	status: z
		.string()
		.refine((val) => ['open', 'dismissed', 'actioned'].includes(val))
		.optional(),
	target_type: z
		.string()
		.refine((val) => ['post', 'comment', 'user'].includes(val))
		.optional(),
	report_id: z.string().uuid().optional(),
	reporter_id: z.string().uuid().optional(),
	target_id: z.string().uuid().optional(),
	oldest_first: z.coerce.boolean().optional(),
});

const updateSchema = z.object({
	status: z
		.string()
		.refine((val) => ['open', 'dismissed', 'actioned'].includes(val)),
});

export const createReportController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = req.user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });

		const parsed = createSchema.parse(req.body);
		const report = await createReport({
			target_type: parsed.target_type as ReportTarget,
			target_id: parsed.target_id,
			reporter_id: user.user_id,
			reason: parsed.reason,
		});
		res.status(201).json({ message: 'Report created', report });
	} catch (err) {
		if ((err as Error).message === 'POST_NOT_FOUND')
			return res.status(404).json({ message: 'Post not found' });
		if ((err as Error).message === 'COMMENT_NOT_FOUND')
			return res.status(404).json({ message: 'Comment not found' });
		next(err);
	}
};

export const listReportsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (req.user?.role != 'admin') {
			return res.status(403).json({ message: 'You are not admin' });
		}
		const parsed = listSchema.parse(req.query);
		const data = await listReports({
			status: parsed.status as ReportStatus | null,
			target_type: parsed.target_type as ReportTarget | null,
			report_id: parsed.report_id as string | null,
			target_id: parsed.target_id as string | null,
			reporter_id: parsed.reporter_id as string | null,
			oldest_first: parsed.oldest_first ?? false,
		});
		res.status(200).json(data);
	} catch (err) {
		next(err);
	}
};

export const updateReportStatusController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (req.user?.role != 'admin') {
			return res.status(403).json({ message: 'You are not admin' });
		}
		const parsed = updateSchema.parse(req.body);
		const { report_id } = req.params;
		const report = await updateReportStatus(
			report_id,
			parsed.status as ReportStatus
		);
		res.status(200).json({ message: 'Report updated', report });
	} catch (err) {
		if ((err as Error).message === 'REPORT_NOT_FOUND')
			return res.status(404).json({ message: 'Report not found' });
		next(err);
	}
};
