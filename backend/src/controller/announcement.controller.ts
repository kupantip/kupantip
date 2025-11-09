import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
	createAnnouncement,
	getActiveAnnouncements,
	deleteAnnouncement,
} from '../models/announcement.model';

const createAnnouncementSchema = z.object({
	title: z.string().min(1).max(300),
	body_md: z.string().min(1),
	start_at: z.string().datetime(),
	end_at: z.string().datetime(),
});

export const createAnnouncementController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Check authentication
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		// Check role (only admin, staff, teacher)
		const { role, user_id } = req.user;
		if (!['admin', 'staff', 'teacher'].includes(role)) {
			return res.status(403).json({
				message:
					'Forbidden: Only admin, staff, and teacher can create announcements',
			});
		}

		// Validate input
		const parsed = createAnnouncementSchema.parse(req.body);

		// Validate date logic
		const startDate = new Date(parsed.start_at);
		const endDate = new Date(parsed.end_at);

		if (endDate <= startDate) {
			return res.status(400).json({
				message: 'end_at must be after start_at',
			});
		}

		// Create announcement
		const announcement = await createAnnouncement({
			author_id: user_id!,
			title: parsed.title,
			body_md: parsed.body_md,
			start_at: startDate,
			end_at: endDate,
		});

		return res.status(201).json({
			message: 'Announcement created successfully',
			announcement,
		});
	} catch (err) {
		next(err);
	}
};

export const getAnnouncementsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const announcements = await getActiveAnnouncements();

		return res.status(200).json({
			announcements,
		});
	} catch (err) {
		next(err);
	}
};

export const deleteAnnouncementController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Check authentication
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		// Check role (only admin, staff, teacher)
		const { role } = req.user;
		if (!['admin', 'staff', 'teacher'].includes(role)) {
			return res.status(403).json({
				message:
					'Forbidden: Only admin, staff, and teacher can delete announcements',
			});
		}

		// Validate announcement_id
		const { announcement_id } = req.params;
		if (!announcement_id) {
			return res
				.status(400)
				.json({ message: 'announcement_id is required' });
		}

		// Delete announcement (soft delete)
		const deleted = await deleteAnnouncement(announcement_id);

		if (!deleted) {
			return res.status(404).json({
				message: 'Announcement not found or already deleted',
			});
		}

		return res.status(200).json({
			message: 'Announcement deleted successfully',
		});
	} catch (err) {
		next(err);
	}
};
