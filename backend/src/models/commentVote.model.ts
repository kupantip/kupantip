import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export interface CommentVoteResult {
	comment_id: string;
	user_id: string;
	value: number; // -1 | 0 | 1
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

	// 2. Ensure value is only -1, 0, or 1 (no unvote logic per new requirement)
	if (![-1, 0, 1].includes(value)) {
		const invalid = new Error('INVALID_VOTE_VALUE');
		throw invalid;
	}

	// 3. Upsert (-1 / 0 / 1)
	const request = pool
		.request()
		.input('comment_id', sql.UniqueIdentifier, comment_id)
		.input('user_id', sql.UniqueIdentifier, user_id)
		.input('value', sql.SmallInt, value);

	const result = await request.query(`
		DECLARE @action NVARCHAR(10);
		IF EXISTS (SELECT 1 FROM [dbo].[comment_vote] WHERE comment_id=@comment_id AND user_id=@user_id)
		BEGIN
			UPDATE [dbo].[comment_vote]
				SET value=@value
				WHERE comment_id=@comment_id AND user_id=@user_id;
			SET @action = 'update';
		END
		ELSE
		BEGIN
			INSERT INTO [dbo].[comment_vote] (comment_id, user_id, value)
				VALUES (@comment_id, @user_id, @value);
			SET @action = 'insert';
		END
		SELECT @comment_id AS comment_id, @user_id AS user_id, @value AS value, @action AS action;
	`);

	return result.recordset[0] as CommentVoteResult;
};
