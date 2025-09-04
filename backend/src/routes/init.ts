import { Router } from 'express';
import * as controller from '../controller/init.controller';
const router = Router({ strict: true });

router.get('/', controller.init);

export default router;
