import express, {
	ErrorRequestHandler,
	Request,
	Response,
	NextFunction,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import initRoute from './routes/init';
import userRoute from './routes/user.route';
import postRoute from './routes/post.route';
import categoryRoutes from './routes/category.route';
import commentRoutes from './routes/comment.route';
import * as z from 'zod';
import { getDbConnection } from './database/mssql.database';

(async () => {
	const cnt = await getDbConnection();
	if (!cnt.connected) {
		process.exit(1);
	}

	console.log('Database Connected Success');
})();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ ok: true }));
const apiV1 = express.Router();

apiV1.use('/init', initRoute);
apiV1.use('/user', userRoute);
apiV1.use('/post', postRoute);
apiV1.use('/categories', categoryRoutes);
apiV1.use('/comment', commentRoutes);

app.use('/api/v1', apiV1);

app.use((req: Request, res: Response) => {
	res.status(404).json({ message: 'Sorry, path that you find not exists!!' });
});

app.use(
	(
		err: ErrorRequestHandler,
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		if (err instanceof z.ZodError) {
			const errors = err.issues.map((issue) => ({
				path: issue.path.join('.'),
				code: issue.code,
				message: issue.message,
				expected: (issue as any).expected,
				received: (issue as any).received,
			}));

			res.status(400).json({
				message: 'Validation failed',
				errors,
			});
			return;
		}
		res.status(500).json({ message: err.message });
	}
);

export default app;
