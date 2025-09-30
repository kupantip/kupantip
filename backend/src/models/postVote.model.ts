import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export interface PostVoteResult {
	post_id: string;
	user_id: string;
	value: number; // -1 | 0 | 1
	action: 'insert' | 'update';
}

export const upsertPostVote = async (
	user_id: string,
	post_id: string,
	value: number
): Promise<PostVoteResult> => {
	const pool = await getDbConnection();

	// 1. Check post exists (avoid FK 547 error & return clean 404 upstream)
	const postCheck = await pool
		.request()
		.input('post_id', sql.UniqueIdentifier, post_id)
		.query(
			'SELECT id FROM [dbo].[post] WHERE id = @post_id AND deleted_at IS NULL'
		);
	if (postCheck.recordset.length === 0) {
		const notFoundErr = new Error('POST_NOT_FOUND');
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
		.input('post_id', sql.UniqueIdentifier, post_id)
		.input('user_id', sql.UniqueIdentifier, user_id)
		.input('value', sql.SmallInt, value);

	const result = await request.query(`
		DECLARE @action NVARCHAR(10);
		IF EXISTS (SELECT 1 FROM [dbo].[post_vote] WHERE post_id=@post_id AND user_id=@user_id)
		BEGIN
			UPDATE [dbo].[post_vote]
				SET value=@value
				WHERE post_id=@post_id AND user_id=@user_id;
			SET @action = 'update';
		END
		ELSE
		BEGIN
			INSERT INTO [dbo].[post_vote] (post_id, user_id, value)
				VALUES (@post_id, @user_id, @value);
			SET @action = 'insert';
		END
		SELECT @post_id AS post_id, @user_id AS user_id, @value AS value, @action AS action;
	`);

	return result.recordset[0] as PostVoteResult;
};
