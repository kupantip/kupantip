import { Router } from 'express';
import {
	createCategoryController,
	getCategoriesController,
	getCategoryByIdController,
} from '../controller/category.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/v1/categories - Only admin can create
router.post('/', authMiddleware, createCategoryController);

// GET /api/v1/categories
router.get('/', getCategoriesController);

// GET /api/v1/categories/:category_id
router.get('/:category_id', getCategoryByIdController);

export default router;
