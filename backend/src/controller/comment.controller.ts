import * as models from '../models/comment.model';
import { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
import * as t from '../types/comment.t';
import { getDbConnection } from '../database/mssql.database';
import { get } from 'http';

async function isPostExist(post_id: string): Promise<boolean> {
	const pool = await getDbConnection();
	const result = await pool
		.request()
		.input('post_id', post_id)
		.query(`SELECT 1 FROM [dbo].[post] WHERE id = @post_id AND deleted_at IS NULL`);

	return result.recordset.length > 0; // true = found, false = not found
}

const createCommentSchema = z.object({
	post_id: z.string().uuid(),
	body_md: z.string().min(1, 'Comment body is required'),
	parent_id: z.string().nullable(),
});

const getCommentsByPostIdSchema = z.object({
	post_id: z.string().uuid(),
});

export const getCommentsByPostId = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
	try {
		getCommentsByPostIdSchema.parse(req.query);
		const { post_id } = req.query;
		
		const exists = await isPostExist(post_id as string);
		if (!exists) {
			res.status(404).json({ message: "Post not found" });
			return;
		}

		const comments = await models.getCommentsByPostId(post_id as string);
        res.json({ 
            message: 'Comments retrieved successfully',
            comments 
        });
    } catch (error) {
        next(error);
    }
};

export const createComment = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { post_id } = req.query;
		const { body_md, parent_id } = req.body;

		

		const data: t.CommentReq = {
			post_id,
			body_md,
			author_id: req.user.user_id,
			parent_id: parent_id || null,
		};

		console.log(data);

		createCommentSchema.parse(data);

		const exists = await isPostExist(post_id as string);
			if (!exists) {
				res.status(404).json({ message: "Post not found" });
				return;
			}

		const comment = await models.create_comment(data);

		if (comment) {
			res.json({ message: 'Comment success', comment });
			return;
		}
		throw new Error('Something went wrong!!');
	} catch (error) {
		next(error);
	}
};


