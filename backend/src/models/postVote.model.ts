import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export interface PostVoteResult {
	post_id: string;
	user_id: string;
	value: number; // -1 / 1
}

export const upsertPostVote = async (
	post_id: string,
	user_id: string,
	value: number
) => {
	const pool = await getDbConnection();
	const result = await pool
		.request()
		.input('post_id', post_id)
		.input('user_id', user_id)
		.input('value', value).query(`
      INSERT INTO [dbo].[post_vote] (post_id, user_id, value)
      OUTPUT INSERTED.*
      VALUES (@post_id, @user_id, @value)`);

	return result.recordset[0] as PostVoteResult;
};

// export const getUserPostVote = async (
// 	user_id: string,
// 	post_id: string
// ): Promise<number> => {
// 	const pool = await getDbConnection();
// 	const r = await pool
// 		.request()
// 		.input('user_id', sql.VarChar, user_id)
// 		.input('post_id', sql.VarChar, post_id)
// 		.query(
// 			'SELECT value FROM dbo.post_vote WHERE user_id=@user_id AND post_id=@post_id'
// 		);

// 	return r.recordset.length ? r.recordset[0].value : 0;
// };
