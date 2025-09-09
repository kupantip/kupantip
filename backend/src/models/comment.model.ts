import { getDbConnection } from '../database/mssql.database';
import { ConnectionPool } from 'mssql';
import * as t from '../types/comment.t';

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
