import { getDbConnection } from '../database/mssql.database';
import { ConnectionPool } from 'mssql';
import * as t from '../types/comment.t';

type CommentWithAuthor = {
    id: string;
    post_id: string;
    author_id: string;
    parent_id: string | null;
    body_md: string;
    created_at: Date;
    updated_at: Date | null;
    deleted_at: Date | null;
    author_name: string;
    replies?: CommentWithAuthor[];
};

export const create_comment = async (data: t.CommentReq) => {
	try {
		const cnt: ConnectionPool = await getDbConnection();

		const check_post = await cnt.request().input('id', data.post_id).query(`
			SELECT id
			FROM dbo.post
			WHERE id = @id
			`);
		if (check_post.recordset.length == 0) {
			throw new Error('Post Not Exists');
		}

		const request_comment = await cnt
			.request()
			.input('post_id', data.post_id)
			.input('user_id', data.author_id)
			.input('parent_id', data.parent_id)
			.input('body_md', data.body_md).query(`
			INSERT INTO [KUPantipDB].[dbo].[comment]
			(
					[post_id]
					,[author_id]
					,[parent_id]
					,[body_md]
			)
			OUTPUT INSERTED.*
			VALUES
			(
					@post_id
					,@user_id
					,@parent_id
					,@body_md
			)
		`);

		return request_comment.recordset[0];
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error('Error in comment model:', error.message);
			throw new Error(error.message);
		}
		throw error;
	}
};

export const getCommentsByPostId = async (post_id: string): Promise<CommentWithAuthor[]> => {
    try {
        const cnt: ConnectionPool = await getDbConnection();
        
        // Get all comments for the post with author information
        const result = await cnt
            .request()
            .input('post_id', post_id)
            .query(`
                SELECT 
                    c.id,
                    c.post_id,
                    c.author_id,
                    c.parent_id,
                    c.body_md,
                    c.created_at,
                    c.updated_at,
                    c.deleted_at,
                    u.display_name as author_name
                FROM [KUPantipDB].[dbo].[comment] c
                LEFT JOIN [KUPantipDB].[dbo].[app_user] u ON c.author_id = u.id
                WHERE c.post_id = @post_id AND c.deleted_at IS NULL
                ORDER BY 
                    CASE WHEN c.parent_id IS NULL THEN c.created_at END ASC,
                    CASE WHEN c.parent_id IS NOT NULL THEN c.created_at END ASC
            `);

        const comments = result.recordset as CommentWithAuthor[];
        
        // Organize comments into a tree structure
        const commentMap = new Map<string, CommentWithAuthor>();
        const rootComments: CommentWithAuthor[] = [];

        // First pass: create a map of all comments
        comments.forEach(comment => {
            comment.replies = [];
            commentMap.set(comment.id, comment);
        });

        // Second pass: organize into tree structure
        comments.forEach(comment => {
            if (comment.parent_id) {
                // This is a reply - add it to its parent's replies array
                const parent = commentMap.get(comment.parent_id);
                if (parent) {
                    if (!parent.replies) parent.replies = [];
                    parent.replies.push(comment);
                }
            } else {
                // This is a root comment
                rootComments.push(comment);
            }
        });

        return rootComments;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error in getCommentsByPostId:', error.message);
            throw new Error(error.message);
        }
        throw error;
    }
};
