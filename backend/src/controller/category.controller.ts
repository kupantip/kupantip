import { Request, Response } from 'express';
import { createCategory, getCategories } from '../models/category.model';

export const createCategoryController = async (req: Request, res: Response) => {
  try {
    const { label, color_hex } = req.body;

    if (!label) {
      return res.status(400).json({ message: 'Label is required' });
    }

    const category = await createCategory(label, color_hex || null);

    return res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create category', error: err });
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
