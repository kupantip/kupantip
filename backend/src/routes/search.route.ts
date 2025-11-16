import { Router } from 'express';
import { searchController } from '../controller/search.controller';
import { optionalAuthMiddleware } from '../middleware/optionalAuth.middleware';

const router = Router();

router.get('/', optionalAuthMiddleware, searchController);

export default router;
