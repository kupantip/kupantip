import { Router } from 'express';
import {
	createCategoryController,
	getCategoriesController,
} from '../controller/category.controller';

const router = Router();

// POST /api/v1/categories
router.post('/', createCategoryController);

// GET /api/v1/categories
router.get('/', getCategoriesController);

export default router;
