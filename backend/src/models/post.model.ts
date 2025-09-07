import { getDbConnection } from '../database/mssql.database';

export const createPost = async (
  author_id: string,
  title: string,
  body_md: string | null,
  url: string | null,
  category_id: string | null
) => {
  const pool = await getDbConnection();
  const result = await pool
    .request()
    .input('author_id', author_id)
    .input('title', title)
    .input('body_md', body_md)
    .input('url', url)
    .input('category_id', category_id)
    .query(
      `INSERT INTO [dbo].[post] (author_id, title, body_md, url, category_id)
       OUTPUT INSERTED.*
       VALUES (@author_id, @title, @body_md, @url, @category_id)`
    );
  return result.recordset[0];
};

export const getPosts = async (category_id?: string) => {
  const pool = await getDbConnection();
  let query = `
    SELECT 
      p.id,
      p.title,
      p.body_md,
      p.url,
      p.created_at,
      p.updated_at,
      u.display_name as author_name,
      c.label as category_label,
      c.id as category_id
    FROM [dbo].[post] p
    LEFT JOIN [dbo].[app_user] u ON p.author_id = u.id
    LEFT JOIN [dbo].[category] c ON p.category_id = c.id
  `;

  if (category_id) {
    query += ` WHERE p.category_id = @category_id`;
  }

  const request = pool.request();
  if (category_id) {
    request.input('category_id', category_id);
  }

  const result = await request.query(query);

  return result.recordset;
};
