import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export interface PostVoteResult {
	post_id: string;
	user_id: string;
	value: number; // -1 | 1
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

	// 2. Ensure value is only -1 or 1 (unvote handled via DELETE endpoint)
	if (![-1, 1].includes(value)) {
		const invalid = new Error('INVALID_VOTE_VALUE');
		throw invalid;
	}

	// 3. Upsert (-1 / 1)
	const request = pool
		.request()
		.input('post_id', sql.UniqueIdentifier, post_id)
		.input('user_id', sql.UniqueIdentifier, user_id)
		.input('value', sql.SmallInt, value);

	const result = await request.query(`
		MERGE [dbo].[post_vote] AS target
		USING (VALUES (@post_id, @user_id, @value)) AS src(post_id, user_id, value)
			ON target.post_id = src.post_id AND target.user_id = src.user_id
		WHEN MATCHED THEN
			UPDATE SET value = src.value
		WHEN NOT MATCHED THEN
			INSERT (post_id, user_id, value) VALUES (src.post_id, src.user_id, src.value)
		OUTPUT $action AS action, inserted.post_id, inserted.user_id, inserted.value;
	`);

	return result.recordset[0] as PostVoteResult;
};

export const deletePostVote = async (
	user_id: string,
	post_id: string
): Promise<{ post_id: string; user_id: string; action: 'delete' }> => {
	const pool = await getDbConnection();

	// Check post exists
	const postCheck = await pool
		.request()
		.input('post_id', sql.UniqueIdentifier, post_id)
		.query(
			'SELECT id FROM [dbo].[post] WHERE id = @post_id AND deleted_at IS NULL'
		);
	if (postCheck.recordset.length === 0) {
		throw new Error('POST_NOT_FOUND');
	}

	// Delete vote row
	const delResult = await pool
		.request()
		.input('post_id', sql.UniqueIdentifier, post_id)
		.input('user_id', sql.UniqueIdentifier, user_id)
		.query(
			'DELETE FROM [dbo].[post_vote] WHERE post_id=@post_id AND user_id=@user_id; SELECT @@ROWCOUNT AS affected;'
		);

	const affected = delResult.recordset[0]?.affected || 0;
	if (affected === 0) {
		throw new Error('VOTE_NOT_FOUND');
	}

	return { post_id, user_id, action: 'delete' };
};
