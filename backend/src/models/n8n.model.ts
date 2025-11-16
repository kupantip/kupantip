import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

type PostForN8n = {
	id: string;
	title: string;
	body_md: string;
};

export const getPostForN8n = async (
	post_id: string
): Promise<PostForN8n | null> => {
	try {
		const pool = await getDbConnection();

		const result = await pool
			.request()
			.input('post_id', sql.UniqueIdentifier, post_id)
			.query(
				`
				SELECT 
					id,
					title,
					body_md
				FROM [dbo].[post]
				WHERE id = @post_id AND deleted_at IS NULL
			`
			);

		if (result.recordset.length === 0) {
			return null;
		}

		return result.recordset[0];
	} catch (error) {
		console.error('Error fetching post for n8n:', error);
		throw error;
	}
};
