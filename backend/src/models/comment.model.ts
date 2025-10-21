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
	reply_count: number;
	minutes_since_commented: number;
	like_count: number;
	dislike_count: number;
	vote_count: number;
	vote_score: number;
	liked_by_requesting_user: boolean;
	disliked_by_requesting_user: boolean;
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
			INSERT INTO [dbo].[comment]
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

export const getCommentsByPostId = async (
	post_id: string,
	requesting_user_id?: string
): Promise<CommentWithAuthor[]> => {
	try {
		const cnt: ConnectionPool = await getDbConnection();

		// Get all comments for the post with author information
		const request = cnt.request().input('post_id', post_id);

		// Bind requesting_user_id for shadowban check
		const sql = await import('mssql');
		request.input(
			'requesting_user_id',
			sql.UniqueIdentifier,
			requesting_user_id ?? null
		);

		const result = await request.query(`
                SELECT 
                    c.id,
                    c.post_id,
                    c.author_id,
                    c.parent_id,
                    c.body_md,
                    c.created_at,
                    c.updated_at,
                    c.deleted_at,
                    u.display_name as author_name,
                    datediff(minute, c.created_at, getdate()) as minutes_since_commented,
					(
                        SELECT COUNT(*) 
                        FROM [dbo].[comment] r
                        WHERE r.parent_id = c.id
                        AND r.deleted_at IS NULL
                    ) AS reply_count,
				ISNULL((
					SELECT SUM(CASE WHEN v.value = 1 THEN 1 ELSE 0 END)
					FROM [dbo].[comment_vote] v
					WHERE v.comment_id = c.id
					  AND (
						NOT EXISTS (
						  SELECT 1 FROM [dbo].[user_ban] ub
						  WHERE ub.user_id = v.user_id
							AND ub.ban_type = 'shadowban'
							AND ub.revoked_at IS NULL
							AND (ub.start_at IS NULL OR ub.start_at <= GETDATE())
							AND (ub.end_at IS NULL OR ub.end_at > GETDATE())
						)
						OR v.user_id = @requesting_user_id
					  )
				), 0) AS like_count,
				ISNULL((
					SELECT SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END)
					FROM [dbo].[comment_vote] v
					WHERE v.comment_id = c.id
					  AND (
						NOT EXISTS (
						  SELECT 1 FROM [dbo].[user_ban] ub
						  WHERE ub.user_id = v.user_id
							AND ub.ban_type = 'shadowban'
							AND ub.revoked_at IS NULL
							AND (ub.start_at IS NULL OR ub.start_at <= GETDATE())
							AND (ub.end_at IS NULL OR ub.end_at > GETDATE())
						)
						OR v.user_id = @requesting_user_id
					  )
				), 0) AS dislike_count,
				(SELECT COUNT(*) FROM [dbo].[comment_vote] v WHERE v.comment_id = c.id AND v.value IN (1,-1)
				  AND (
					NOT EXISTS (
					  SELECT 1 FROM [dbo].[user_ban] ub
					  WHERE ub.user_id = v.user_id
						AND ub.ban_type = 'shadowban'
						AND ub.revoked_at IS NULL
						AND (ub.start_at IS NULL OR ub.start_at <= GETDATE())
						AND (ub.end_at IS NULL OR ub.end_at > GETDATE())
					)
					OR v.user_id = @requesting_user_id
				  )
				) AS vote_count,
	  			COALESCE((SELECT SUM(v.value) FROM [dbo].[comment_vote] v WHERE v.comment_id = c.id
				  AND (
					NOT EXISTS (
					  SELECT 1 FROM [dbo].[user_ban] ub
					  WHERE ub.user_id = v.user_id
						AND ub.ban_type = 'shadowban'
						AND ub.revoked_at IS NULL
						AND (ub.start_at IS NULL OR ub.start_at <= GETDATE())
						AND (ub.end_at IS NULL OR ub.end_at > GETDATE())
					)
					OR v.user_id = @requesting_user_id
				  )
				),0) AS vote_score,
				CAST(
					CASE 
						WHEN @requesting_user_id IS NOT NULL AND EXISTS (
							SELECT 1 FROM [dbo].[comment_vote] v
							WHERE v.comment_id = c.id AND v.user_id = @requesting_user_id AND v.value = 1
						) THEN 1 ELSE 0 END AS BIT
				) AS liked_by_requesting_user,
				CAST(
					CASE 
						WHEN @requesting_user_id IS NOT NULL AND EXISTS (
							SELECT 1 FROM [dbo].[comment_vote] v
							WHERE v.comment_id = c.id AND v.user_id = @requesting_user_id AND v.value = -1
						) THEN 1 ELSE 0 END AS BIT
				) AS disliked_by_requesting_user
                FROM [dbo].[comment] c
                LEFT JOIN [dbo].[app_user] u ON c.author_id = u.id
                WHERE c.post_id = @post_id AND c.deleted_at IS NULL
				  -- Shadowban filter: hide comments from shadowbanned users unless viewing own comments
				  AND (
					-- Show if author is not shadowbanned
					NOT EXISTS (
					  SELECT 1 FROM [dbo].[user_ban] ub
					  WHERE ub.user_id = c.author_id
						AND ub.ban_type = 'shadowban'
						AND ub.revoked_at IS NULL
						AND (ub.start_at IS NULL OR ub.start_at <= GETDATE())
						AND (ub.end_at IS NULL OR ub.end_at > GETDATE())
					)
					-- OR show if requesting user is the author (shadowbanned users see their own comments)
					OR (@requesting_user_id IS NOT NULL AND c.author_id = @requesting_user_id)
				  )
                ORDER BY 
                    CASE WHEN c.parent_id IS NULL THEN c.created_at END ASC,
                    CASE WHEN c.parent_id IS NOT NULL THEN c.created_at END ASC
            `);

		const comments = result.recordset as CommentWithAuthor[];

		// Organize comments into a tree structure
		const commentMap = new Map<string, CommentWithAuthor>();
		const rootComments: CommentWithAuthor[] = [];

		// First pass: create a map of all comments
		comments.forEach((comment) => {
			comment.replies = [];
			commentMap.set(comment.id, comment);
		});

		// Second pass: organize into tree structure
		comments.forEach((comment) => {
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

export const deleteComment = async (
	comment_id: string,
	user_id?: string,
	role?: string,
	post_owner_id?: string
): Promise<{ success: boolean; message: string }> => {
	try {
		const cnt: ConnectionPool = await getDbConnection();
		// Check if comment exists
		const check = await cnt
			.request()
			.input('comment_id', comment_id)
			.query(
				'SELECT author_id, post_id, deleted_at FROM [dbo].[comment] WHERE id = @comment_id'
			);
		if (check.recordset.length === 0) {
			return { success: false, message: 'Comment not found' };
		}
		const comment = check.recordset[0];
		if (comment.deleted_at) {
			return { success: false, message: 'Comment already deleted' };
		}
		// Check permission: author, admin, or post owner
		if (
			role !== 'admin' &&
			user_id !== comment.author_id &&
			user_id !== post_owner_id
		) {
			return {
				success: false,
				message: 'Not authorized to delete this comment',
			};
		}
		// Delete
		await cnt
			.request()
			.input('comment_id', comment_id)
			.query(
				'UPDATE [dbo].[comment] SET deleted_at = GETDATE() OUTPUT INSERTED.* WHERE id = @comment_id'
			);
		return { success: true, message: 'Comment deleted' };
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error('Error in deleteComment:', error.message);
			throw new Error(error.message);
		}
		throw error;
	}
};

export const updateComment = async (
	comment_id: string,
	user_id: string,
	body_md: string
): Promise<{
	success: boolean;
	message: string;
	updated?: Record<string, unknown>;
}> => {
	try {
		const cnt: ConnectionPool = await getDbConnection();
		const result = await cnt
			.request()
			.input('comment_id', comment_id)
			.input('user_id', user_id)
			.input('body_md', body_md).query(`
                UPDATE [dbo].[comment]
                SET body_md = @body_md, updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @comment_id AND author_id = @user_id AND deleted_at IS NULL
            `);
		if (result.recordset.length === 0) {
			return {
				success: false,
				message: 'Comment not found or not authorized',
			};
		}
		return {
			success: true,
			message: 'Comment updated',
			updated: result.recordset[0],
		};
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error('Error in updateComment:', error.message);
			throw new Error(error.message);
		}
		throw error;
	}
};
