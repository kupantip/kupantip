import { Request, Response, NextFunction } from 'express';
import { createCategory, getCategories } from '../models/category.model';
import * as z from 'zod';

const categorySchema = z.object({
  label: z.string().min(1, 'Label is required'),
  color_hex: z.string().min(7, 'use hex color code, e.g. #ffffff').max(7),
});

export const createCategoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    categorySchema.parse(req.body);

    const { label, color_hex } = req.body;

    const existingCategories = await getCategories();
    const exists = existingCategories.find(
      (c) => c.label.toLowerCase() === label.toLowerCase()
    );

    if (exists) {
      return res
        .status(400)
        .json({ message: `Category "${label}" already exists` });
    }

    const category = await createCategory(label, color_hex || null);

    return res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    // return res.status(500).json({ message: 'Failed to create category', error: err });
    next(err);
  }
};

export const getCategoriesController = async (_req: Request, res: Response) => {
  try {
    const categories = await getCategories();
    return res.status(200).json(categories);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch categories', error: err });
  }
};
