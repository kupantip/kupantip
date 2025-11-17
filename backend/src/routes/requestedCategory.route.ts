import { Router } from 'express';
import {
	createRequestedCategoryController,
	getRequestedCategoriesController,
	getRequestedCategoryByIdController,
	updateRequestedCategoryController,
} from '../controller/requestedCategory.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/v1/requested-categories - Create new request (any authenticated user)
router.post('/', createRequestedCategoryController);

// GET /api/v1/requested-categories - Get all requests (admin: all, user: own)
router.get('/', getRequestedCategoriesController);

// GET /api/v1/requested-categories/:id - Get specific request
router.get('/:id', getRequestedCategoryByIdController);

// PATCH /api/v1/requested-categories/:id - Update status (admin only)
router.patch('/:id', updateRequestedCategoryController);

export default router;
