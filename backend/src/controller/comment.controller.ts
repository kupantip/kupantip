import * as models from '../models/comment.model';
import { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
import * as t from '../types/comment.t';
import { getDbConnection } from '../database/mssql.database';

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

const deleteCommentSchema = z.object({
	comment_id: z.string().uuid(),
});

const updateCommentSchema = z.object({
    comment_id: z.string().uuid(),
    body_md: z.string().min(1, 'Comment body is required'),
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
		if (parent_id) {
			const pool = await getDbConnection();
			const result = await pool
		
				.request()
				.input('parent_id', parent_id)
				.query(`SELECT 1 FROM [dbo].[comment] WHERE id = @parent_id AND deleted_at IS NULL`);

			// true = found, false = not found
			if (result.recordset.length <= 0) {
				res.status(404).json({ message: "Parent comment_id not found" });
				return;
			}
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

export const deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        deleteCommentSchema.parse(req.params);
        const { comment_id } = req.params;
        const user_id = req.user?.user_id;
        const role = req.user?.role;
        let post_owner_id: string | undefined = undefined;
        // Find post owner for this comment
        const pool = await getDbConnection();
        const postResult = await pool
            .request()
            .input('comment_id', comment_id)
            .query(`SELECT p.author_id as post_owner_id FROM [KUPantipDB].[dbo].[comment] c JOIN [KUPantipDB].[dbo].[post] p ON c.post_id = p.id WHERE c.id = @comment_id`);
        if (postResult.recordset.length > 0) {
            post_owner_id = postResult.recordset[0].post_owner_id;
        }
        const result = await models.deleteComment(comment_id, user_id, role, post_owner_id);
        if (!result.success) {
            res.status(404).json({ message: result.message });
            return;
        }
        res.json({ message: result.message });
    } catch (error) {
        next(error);
    }
};

export const updateComment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        updateCommentSchema.parse({
            comment_id: req.params.comment_id,
            body_md: req.body.body_md,
        });
        const { comment_id } = req.params;
        const { body_md } = req.body;
        const user_id = req.user?.user_id;
        if (!user_id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const result = await models.updateComment(comment_id, user_id, body_md);
        if (!result.success) {
            res.status(404).json({ message: result.message });
            return;
        }
        res.json({ message: result.message, comment: result.updated });
    } catch (error) {
        next(error);
    }
};



