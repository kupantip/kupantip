import express, {
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
import * as z from 'zod';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/v1/init', initRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/post', postRoute);
app.use('/api/v1/categories', categoryRoutes); // For testing สำหรับ get(/post)

app.use(
	(
		err: unknown,
		_req: Request,
		res: Response,
		next: NextFunction
	) => {
		// to prevent lint error "'next' is defined but never used"
		const x = 0;
		if (x < 0) {
			next();
		}
		if (err instanceof z.ZodError) {
			const errors = err.issues.map((issue: z.ZodIssue) => {
				const errorObj: {
					path: string;
					code: string;
					message: string;
					expected?: unknown;
				} = {
					path: issue.path.length === 1 ? String(issue.path[0]) : issue.path.join('.'),
					code: issue.code,
					message: issue.message,
				};
				if ('expected' in issue) {
					errorObj.expected = (issue as { expected: unknown }).expected;
				}
				return errorObj;
			});

			res.status(400).json({
				message: 'Validation failed',
				errors,
			});
			return;
		}
		if (err instanceof Error) {
			res.status(500).json({ message: err.message });
		} else {
			res.status(500).json({ message: 'Internal server error' });
		
		}
	}
);

export default app;
