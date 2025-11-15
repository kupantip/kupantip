import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import initRoute from './routes/init';
import userRoute from './routes/user.route';
import postRoute from './routes/post.route';
import categoryRoutes from './routes/category.route';
import commentRoutes from './routes/comment.route';
import postVoteRoutes from './routes/postVote.route';
import commentVoteRoutes from './routes/commentVote.route';
import reportRoutes from './routes/report.route';
import banRoutes from './routes/ban.route';
import moderationActionRoutes from './routes/moderationAction.route';
import statsRoutes from './routes/stats.route';
import announcementRoute from './routes/announcement.route';
import searchRoute from './routes/search.route';
import * as z from 'zod';

const app = express();
app.use(helmet());
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
);
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
apiV1.use('/post-vote', postVoteRoutes);
apiV1.use('/comment-vote', commentVoteRoutes);
apiV1.use('/report', reportRoutes);
apiV1.use('/ban', banRoutes);
apiV1.use('/moderation-actions', moderationActionRoutes);
apiV1.use('/stats', statsRoutes);
apiV1.use('/announcement', announcementRoute);
apiV1.use('/search', searchRoute);

app.use('/api/v1', apiV1);

app.use((req: Request, res: Response) => {
	res.status(404).json({ message: 'Sorry, path that you find not exists!!' });
});

app.use((err: unknown, _req: Request, res: Response) => {
	if (err instanceof z.ZodError) {
		const errors = err.issues.map((issue: z.ZodIssue) => {
			const errorObj: {
				path: string;
				code: string;
				message: string;
				expected?: unknown;
			} = {
				path:
					issue.path.length === 1
						? String(issue.path[0])
						: issue.path.join('.'),
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
});

export default app;
