import { Request, Response, NextFunction } from 'express';
import {
	createCategory,
	getCategories,
	getCategoryById,
} from '../models/category.model';
import * as z from 'zod';

const categorySchema = z.object({
	label: z.string().min(1, 'Label is required'),
	color_hex: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format'),
	detail: z.string().max(500).optional().nullable(),
});

const categoryIdSchema = z.object({
	category_id: z.string().uuid('Invalid category_id format'),
});

export const createCategoryController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		categorySchema.parse(req.body);

		const { label, color_hex, detail } = req.body;

		const existingCategories = await getCategories();
		const exists = existingCategories.find(
			(c) => c.label.toLowerCase() === label.toLowerCase()
		);

		if (exists) {
			return res
				.status(400)
				.json({ message: `Category "${label}" already exists` });
		}

		const category = await createCategory(label, color_hex, detail || null);

		return res.status(201).json({ message: 'Category created', category });
	} catch (err) {
		// return res.status(500).json({ message: 'Failed to create category', error: err });
		next(err);
	}
};

export const getCategoriesController = async (
	_req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const categories = await getCategories();
		return res.status(200).json(categories);
	} catch (err) {
		next(err);
	}
};

export const getCategoryByIdController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { category_id } = categoryIdSchema.parse(req.params);

		const category = await getCategoryById(category_id);

		if (!category) {
			return res.status(404).json({ message: 'Category not found' });
		}

		return res.status(200).json(category);
	} catch (err) {
		next(err);
	}
};
