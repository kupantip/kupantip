import { getDbConnection } from '../database/mssql.database';

export const createRequestedCategory = async (
	requester_id: string,
	label: string,
	color_hex: string | null,
	detail: string | null
) => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('requester_id', requester_id)
		.input('label', label)
		.input('color_hex', color_hex)
		.input('detail', detail)
		.query(
			`INSERT INTO [dbo].[requested_category] (requester_id, label, color_hex, detail, status)
       OUTPUT inserted.id, inserted.requester_id, inserted.label, inserted.color_hex, inserted.detail, inserted.status, inserted.created_at, inserted.reviewed_at, inserted.reviewed_by
       VALUES (@requester_id, @label, @color_hex, @detail, 'open')`
		);

	return result.recordset[0];
};

export const getRequestedCategories = async (
	status?: string,
	recent: boolean = true
) => {
	const pool = await getDbConnection();

	let query = `
    SELECT 
      rc.id, 
      rc.requester_id, 
      rc.label, 
      rc.color_hex, 
      rc.detail, 
      rc.status, 
      rc.created_at, 
      rc.reviewed_at, 
      rc.reviewed_by,
      u.display_name as requester_name,
      reviewer.display_name as reviewer_name
    FROM [dbo].[requested_category] rc
    INNER JOIN [dbo].[app_user] u ON rc.requester_id = u.id
    LEFT JOIN [dbo].[app_user] reviewer ON rc.reviewed_by = reviewer.id
  `;

	if (status) {
		query += ` WHERE rc.status = @status`;
	}

	query += ` ORDER BY rc.created_at ${recent ? 'DESC' : 'ASC'}`;

	const request = pool.request();
	if (status) {
		request.input('status', status);
	}

	const result = await request.query(query);
	return result.recordset;
};

export const getRequestedCategoryById = async (id: string) => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('id', id)
		.query(
			`
			SELECT 
				rc.id, 
				rc.requester_id, 
				rc.label, 
				rc.color_hex, 
				rc.detail, 
				rc.status, 
				rc.created_at, 
				rc.reviewed_at, 
				rc.reviewed_by,
				u.display_name as requester_name,
				reviewer.display_name as reviewer_name
			FROM [dbo].[requested_category] rc
			INNER JOIN [dbo].[app_user] u ON rc.requester_id = u.id
			LEFT JOIN [dbo].[app_user] reviewer ON rc.reviewed_by = reviewer.id
			WHERE rc.id = @id
		`
		);

	return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const updateRequestedCategoryStatus = async (
	id: string,
	status: string,
	reviewed_by: string
) => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('id', id)
		.input('status', status)
		.input('reviewed_by', reviewed_by)
		.input('reviewed_at', new Date())
		.query(
			`UPDATE [dbo].[requested_category] 
       SET status = @status, reviewed_by = @reviewed_by, reviewed_at = @reviewed_at
       OUTPUT inserted.id, inserted.requester_id, inserted.label, inserted.color_hex, inserted.detail, inserted.status, inserted.reviewed_at, inserted.reviewed_by
       WHERE id = @id`
		);

	return result.recordset[0];
};

export const createCategoryFromRequest = async (
	label: string,
	color_hex: string | null,
	detail: string | null
) => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('label', label)
		.input('color_hex', color_hex)
		.input('detail', detail)
		.query(
			`INSERT INTO [dbo].[category] (label, color_hex, detail)
       OUTPUT inserted.id, inserted.label, inserted.color_hex, inserted.detail
       VALUES (@label, @color_hex, @detail)`
		);

	return result.recordset[0];
};
