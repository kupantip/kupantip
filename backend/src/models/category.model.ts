import { getDbConnection } from '../database/mssql.database';

export const createCategory = async (label: string, color_hex: string | null) => {
  const pool = await getDbConnection();

  const result = await pool
    .request()
    .input('label', label)
    .input('color_hex', color_hex)
    .query(
      `INSERT INTO [dbo].[category] (label, color_hex)
       OUTPUT inserted.id, inserted.label, inserted.color_hex
       VALUES (@label, @color_hex)`
    );

  return result.recordset[0];
};

export const getCategories = async () => {
  const pool = await getDbConnection();

  const result = await pool.request().query(`
    SELECT id, label, color_hex FROM [dbo].[category]
  `);

  return result.recordset;
};
