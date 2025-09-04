import { getDbConnection } from '../database/mssql.database';
import { ConnectionPool, IResult } from 'mssql';

export const init = async (): Promise<IResult<{ One: string }>> => {
	try {
		const cnt: ConnectionPool = await getDbConnection();
		const request = cnt.request();

		const dataResult = await request.query<{ One: string }>(
			`SELECT TOP (1000) [id]
      		,[email]
      		,[handle]
      		,[display_name]
      		,[created_at]
    		,[updated_at]
  			FROM [KUPantipDB].[dbo].[app_user]`
		);
		return dataResult;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error('Error in template model:', error.message);
			throw new Error(error.message);
		}
		throw error; // fallback
	}
};
