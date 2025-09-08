import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

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
    .query(`
      INSERT INTO [dbo].[post] (author_id, title, body_md, url, category_id)
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
      c.id as category_id,
      (
        SELECT a.id, a.url, a.mime_type, a.created_at
        FROM [dbo].[attachment] a
        WHERE a.post_id = p.id
        FOR JSON PATH
      ) as attachments
    FROM [dbo].[post] p
    LEFT JOIN [dbo].[app_user] u ON p.author_id = u.id
    LEFT JOIN [dbo].[category] c ON p.category_id = c.id
    WHERE p.deleted_at IS NULL
  `;


  if (category_id) {
    query += ` AND p.category_id = @category_id`;
  }

  const request = pool.request();
  if (category_id) {
    request.input('category_id', category_id);
  }

  const result = await request.query(query);

  return result.recordset.map((row: any) => ({
    ...row,
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
  }));
};


export const addAttachment = async (
  post_id: string,
  url: string,
  mime_type: string | null
) => {
  const pool = await getDbConnection();
  const result = await pool
    .request()
    .input('post_id', post_id)
    .input('url', url)
    .input('mime_type', mime_type)
    .query(`
      INSERT INTO [dbo].[attachment] (post_id, url, mime_type)
      OUTPUT INSERTED.*
      VALUES (@post_id, @url, @mime_type)
    `);
  return result.recordset[0];
};



export const deletePost = async (post_id: string, user_id?: string) => {
  const pool = await getDbConnection();
  let query = `
    UPDATE [dbo].[post]
    SET deleted_at = GETDATE()
    OUTPUT INSERTED.*
    WHERE id = @post_id AND deleted_at IS NULL
  `;

  const request = pool.request().input('post_id', sql.UniqueIdentifier, post_id);

  if (user_id) {
    // ถ้าไม่ใช่ admin → ต้องตรวจสอบว่าเป็นเจ้าของโพส
    query += ` AND author_id = @user_id`;
    request.input('user_id', sql.UniqueIdentifier, user_id);
  }

  const result = await request.query(query);
  return result.recordset[0];
};



export const updatePost = async (
  post_id: string,
  author_id: string,
  title?: string,
  body_md?: string,
  category_id?: string
) => {
  const pool = await getDbConnection();

  const result = await pool
    .request()
    .input('post_id', post_id)
    .input('author_id', author_id)
    .input('title', title || null)
    .input('body_md', body_md || null)
    .input('category_id', category_id || null)
    .query(`
      UPDATE [dbo].[post]
      SET 
        title = ISNULL(@title, title),
        body_md = ISNULL(@body_md, body_md),
        category_id = @category_id,
        updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @post_id AND author_id = @author_id AND deleted_at IS NULL
    `);

  return result.recordset[0];
};
