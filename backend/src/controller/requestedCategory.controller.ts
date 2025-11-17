import { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
import {
	createRequestedCategory,
	getRequestedCategories,
	getRequestedCategoryById,
	updateRequestedCategoryStatus,
	createCategoryFromRequest,
} from '../models/requestedCategory.model';
import { getCategoryByLabel } from '../models/category.model';

const createRequestedCategorySchema = z.object({
	label: z.string().min(1, 'Label is required'),
	color_hex: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format'),
	detail: z.string().optional().nullable(),
});

const updateRequestedCategorySchema = z.object({
	status: z.enum(['open', 'dismissed', 'actioned'], {
		message: 'Status must be one of: open, dismissed, actioned',
	}),
});

const requestedCategoryIdSchema = z.object({
	id: z.string().uuid('Invalid requested_category id format'),
});

const getRequestedCategoriesQuerySchema = z.object({
	status: z.enum(['open', 'dismissed', 'actioned']).optional(),
	recent: z
		.enum(['true', 'false'])
		.optional()
		.default('true')
		.transform((val) => val === 'true'),
});

export const createRequestedCategoryController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Check authentication
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { label, color_hex, detail } =
			createRequestedCategorySchema.parse(req.body);

		// Check if category already exists in category table
		const existingCategory = await getCategoryByLabel(label);
		if (existingCategory) {
			return res.status(400).json({
				message: `Category "${label}" already exists`,
			});
		}

		// Check for duplicate label in requested_category (open or actioned)
		const allRequests = await getRequestedCategories();
		const existingRequest = allRequests.find(
			(r) =>
				r.label.toLowerCase() === label.toLowerCase() &&
				r.status === 'actioned'
		);

		if (existingRequest) {
			return res.status(400).json({
				message: `Category "${label}" already exists`,
			});
		}

		const requestedCategory = await createRequestedCategory(
			req.user.user_id,
			label,
			color_hex,
			detail || null
		);

		return res.status(201).json({
			message: 'Category request created',
			data: requestedCategory,
		});
	} catch (err) {
		next(err);
	}
};

export const getRequestedCategoriesController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Check authentication
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { status, recent } = getRequestedCategoriesQuerySchema.parse(
			req.query
		);

		// If not admin, only show user's own requests
		let requests;
		if (req.user.role === 'admin') {
			requests = await getRequestedCategories(status, recent);
		} else {
			requests = await getRequestedCategories(status, recent);
			requests = requests.filter(
				(r) => r.requester_id === req.user!.user_id
			);
		}

		return res.status(200).json(requests);
	} catch (err) {
		next(err);
	}
};

export const getRequestedCategoryByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Check authentication
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { id } = requestedCategoryIdSchema.parse(req.params);

		const requestedCategory = await getRequestedCategoryById(id);

		if (!requestedCategory) {
			return res
				.status(404)
				.json({ message: 'Requested category not found' });
		}

		// If not admin, only allow viewing own requests
		if (
			req.user.role !== 'admin' &&
			requestedCategory.requester_id !== req.user.user_id
		) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		return res.status(200).json(requestedCategory);
	} catch (err) {
		next(err);
	}
};

export const updateRequestedCategoryController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Check authentication
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		// Only admin can update status
		if (req.user.role !== 'admin') {
			return res.status(403).json({
				message: 'Forbidden: Only admin can review category requests',
			});
		}

		const { id } = requestedCategoryIdSchema.parse(req.params);
		const { status } = updateRequestedCategorySchema.parse(req.body);

		// Get the requested category
		const requestedCategory = await getRequestedCategoryById(id);

		if (!requestedCategory) {
			return res
				.status(404)
				.json({ message: 'Requested category not found' });
		}

		// If status is actioned, check if category already exists and create it
		if (status === 'actioned') {
			const existingCategory = await getCategoryByLabel(
				requestedCategory.label
			);
			if (existingCategory) {
				return res.status(400).json({
					message: `Category "${requestedCategory.label}" already exists`,
				});
			}
			// Create the category in category table
			await createCategoryFromRequest(
				requestedCategory.label,
				requestedCategory.color_hex,
				requestedCategory.detail
			);

			// Auto-dismiss all other pending requests with the same label
			const allRequests = await getRequestedCategories();
			const duplicateRequests = allRequests.filter(
				(r) =>
					r.label.toLowerCase() ===
						requestedCategory.label.toLowerCase() &&
					r.id !== id &&
					r.status === 'open'
			);

			// Dismiss all duplicate requests
			for (const duplicateRequest of duplicateRequests) {
				await updateRequestedCategoryStatus(
					duplicateRequest.id,
					'dismissed',
					req.user.user_id
				);
			}
		}

		// Update the requested category status
		const updated = await updateRequestedCategoryStatus(
			id,
			status,
			req.user.user_id
		);

		res.status(200).json({
			message: `Category request ${status}`,
			data: updated,
		});
	} catch (err) {
		next(err);
	}
};
