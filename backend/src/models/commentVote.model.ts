import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export interface CommentVoteResult {
	comment_id: string;
	user_id: string;
	value: number; // -1 | 1
	action: 'insert' | 'update';
}

export const upsertCommentVote = async (
	user_id: string,
	comment_id: string,
	value: number
): Promise<CommentVoteResult> => {
	const pool = await getDbConnection();

	// 1. Check comment exists (avoid FK 547 error & return clean 404 upstream)
	const commentCheck = await pool
		.request()
		.input('comment_id', sql.UniqueIdentifier, comment_id)
		.query(
			'SELECT id FROM [dbo].[comment] WHERE id = @comment_id AND deleted_at IS NULL'
		);
	if (commentCheck.recordset.length === 0) {
		const notFoundErr = new Error('COMMENT_NOT_FOUND');
		throw notFoundErr;
	}

	// 2. Ensure value is only -1 or 1 (unvote handled via DELETE endpoint)
	if (![-1, 1].includes(value)) {
		const invalid = new Error('INVALID_VOTE_VALUE');
		throw invalid;
	}

	// 3. Upsert (-1 / 1)
	const request = pool
		.request()
		.input('comment_id', sql.UniqueIdentifier, comment_id)
		.input('user_id', sql.UniqueIdentifier, user_id)
		.input('value', sql.SmallInt, value);

	const result = await request.query(`
		MERGE [dbo].[comment_vote] AS target
		USING (VALUES (@comment_id, @user_id, @value)) AS src(comment_id, user_id, value)
			ON target.comment_id = src.comment_id AND target.user_id = src.user_id
		WHEN MATCHED THEN
			UPDATE SET value = src.value
		WHEN NOT MATCHED THEN
			INSERT (comment_id, user_id, value) VALUES (src.comment_id, src.user_id, src.value)
		OUTPUT $action AS action, inserted.comment_id, inserted.user_id, inserted.value;
	`);

	return result.recordset[0] as CommentVoteResult;
};

export const deleteCommentVote = async (
	user_id: string,
	comment_id: string
): Promise<{ comment_id: string; user_id: string; action: 'delete' }> => {
	const pool = await getDbConnection();

	// Check comment exists
	const commentCheck = await pool
		.request()
		.input('comment_id', sql.UniqueIdentifier, comment_id)
		.query(
			'SELECT id FROM [dbo].[comment] WHERE id = @comment_id AND deleted_at IS NULL'
		);
	if (commentCheck.recordset.length === 0) {
		throw new Error('COMMENT_NOT_FOUND');
	}

	// Delete vote row
	const delResult = await pool
		.request()
		.input('comment_id', sql.UniqueIdentifier, comment_id)
		.input('user_id', sql.UniqueIdentifier, user_id)
		.query(
			'DELETE FROM [dbo].[comment_vote] WHERE comment_id=@comment_id AND user_id=@user_id; SELECT @@ROWCOUNT AS affected;'
		);

	const affected = delResult.recordset[0]?.affected || 0;
	if (affected === 0) {
		throw new Error('VOTE_NOT_FOUND');
	}

	return { comment_id, user_id, action: 'delete' };
};
