import { getDbConnection } from '../database/mssql.database';

export const createCategory = async (
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

export const getCategories = async (recent: boolean = true) => {
	const pool = await getDbConnection();

	const orderBy = recent ? 'ORDER BY id DESC' : 'ORDER BY id ASC';

	const result = await pool.request().query(`
    SELECT id, label, color_hex, detail FROM [dbo].[category]
    ${orderBy}
  `);

	return result.recordset;
};

export const getCategoryById = async (category_id: string) => {
	const pool = await getDbConnection();

	const result = await pool.request().input('category_id', category_id)
		.query(`
			SELECT id, label, color_hex, detail 
			FROM [dbo].[category]
			WHERE id = @category_id
		`);

	return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const getCategoryByLabel = async (label: string) => {
	const pool = await getDbConnection();

	const result = await pool.request().input('label', label).query(`
			SELECT id, label, color_hex, detail 
			FROM [dbo].[category]
			WHERE LOWER(label) = LOWER(@label)
		`);

	return result.recordset.length > 0 ? result.recordset[0] : null;
};
