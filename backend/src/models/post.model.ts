import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

type PostRow = {
	id: string;
	title: string;
	body_md: string | null;
	url: string | null;
	created_at: Date;
	updated_at: Date;
	author_name: string;
	author_id: string;
	category_label: string | null;
	category_color: string | null;
	category_id: string | null;
	attachments: string;
	minutes_since_posted: number;
	comment_count: number;
	like_count: number;
	dislike_count: number;
	vote_count: number;
	vote_score: number;
	liked_by_requesting_user: boolean;
	disliked_by_requesting_user: boolean;
};

type CategorySummaryRow = {
	category_id: string;
	category_label: string;
	category_color: string | null;
	post_count: number;
	total_vote_count: number;
	total_comment: number;
	total_engagement: number;
};

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
		.input('category_id', category_id).query(`
      INSERT INTO [dbo].[post] (author_id, title, body_md, url, category_id)
      OUTPUT INSERTED.*
      VALUES (@author_id, @title, @body_md, @url, @category_id)`);
	return result.recordset[0];
};

export const getPosts = async (
	category_id?: string,
	user_id?: string,
	post_id?: string,
	recent?: boolean,
	requesting_user_id?: string
) => {
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
      u.id as author_id,
      c.label as category_label,
	  c.color_hex as category_color,
      c.id as category_id,
      (
        SELECT a.id, a.url, a.mime_type
        FROM [dbo].[attachment] a
        WHERE a.post_id = p.id
        FOR JSON PATH
      ) as attachments,
      DATEDIFF(minute, p.created_at, GETDATE()) AS minutes_since_posted,
      (SELECT COUNT(*) FROM [dbo].[comment] cm WHERE cm.post_id = p.id AND cm.deleted_at IS NULL) AS comment_count,
	  (SELECT COUNT(*) FROM [dbo].[post_vote] pv WHERE pv.post_id = p.id AND pv.value IN (1,-1)) AS vote_count,
	  COALESCE((SELECT SUM(pv.value) FROM [dbo].[post_vote] pv WHERE pv.post_id = p.id),0) AS vote_score,
	  ISNULL((
		SELECT SUM(CASE WHEN pv.value = 1 THEN 1 ELSE 0 END)
		FROM [dbo].[post_vote] pv
		WHERE pv.post_id = p.id
		), 0) AS like_count,
	  ISNULL((
		SELECT SUM(CASE WHEN pv.value = -1 THEN 1 ELSE 0 END)
		FROM [dbo].[post_vote] pv
		WHERE pv.post_id = p.id
				), 0) AS dislike_count,
			CAST(
				CASE 
					WHEN @requesting_user_id IS NOT NULL AND EXISTS (
						SELECT 1 FROM [dbo].[post_vote] pv
						WHERE pv.post_id = p.id AND pv.user_id = @requesting_user_id AND pv.value = 1
					) THEN 1 ELSE 0 END AS BIT
			) AS liked_by_requesting_user,
			CAST(
				CASE 
					WHEN @requesting_user_id IS NOT NULL AND EXISTS (
						SELECT 1 FROM [dbo].[post_vote] pv
						WHERE pv.post_id = p.id AND pv.user_id = @requesting_user_id AND pv.value = -1
					) THEN 1 ELSE 0 END AS BIT
			) AS disliked_by_requesting_user
    FROM [dbo].[post] p
    LEFT JOIN [dbo].[app_user] u ON p.author_id = u.id
    LEFT JOIN [dbo].[category] c ON p.category_id = c.id
    WHERE p.deleted_at IS NULL
	`;

	const request = pool.request();
	// Bind current user for like/dislike checks (nullable)
	request.input(
		'requesting_user_id',
		sql.UniqueIdentifier,
		requesting_user_id ?? null
	);

	if (category_id) {
		query += ` AND p.category_id = @category_id`;
		request.input('category_id', category_id);
	}

	if (user_id) {
		query += ` AND p.author_id = @user_id`;
		request.input('user_id', user_id);
	}

	if (post_id) {
		query += ` AND p.id = @post_id`;
		request.input('post_id', post_id);
	}

	if (!recent) {
		query += `\n    ORDER BY p.created_at ASC, p.id ASC`;
	} else {
		query += `\n    ORDER BY p.created_at DESC, p.id DESC`;
	}

	const result = await request.query(query);

	// parse JSON attachments
	return result.recordset.map((row: PostRow) => ({
		...row,
		attachments: row.attachments ? JSON.parse(row.attachments) : [],
	}));
};

export const getHotPostsByCategory = async (requesting_user_id?: string) => {
	const pool = await getDbConnection();

	// Build a query that ranks posts within each category by engagement (vote_count + comment_count)
	// and picks the top 1
	const query = `
		WITH Base AS (
			SELECT 
				p.id,
				p.title,
				p.body_md,
				p.url,
				p.created_at,
				p.updated_at,
				u.display_name AS author_name,
				u.id AS author_id,
				c.label AS category_label,
				c.color_hex AS category_color,
				c.id AS category_id,
				(
					SELECT a.id, a.url, a.mime_type
					FROM [dbo].[attachment] a
					WHERE a.post_id = p.id
					FOR JSON PATH
				) AS attachments,
				DATEDIFF(minute, p.created_at, GETDATE()) AS minutes_since_posted,
				(SELECT COUNT(*) FROM [dbo].[comment] cm WHERE cm.post_id = p.id AND cm.deleted_at IS NULL) AS comment_count,
				(SELECT COUNT(*) FROM [dbo].[post_vote] pv WHERE pv.post_id = p.id AND pv.value IN (1,-1)) AS vote_count,
				COALESCE((SELECT SUM(pv.value) FROM [dbo].[post_vote] pv WHERE pv.post_id = p.id), 0) AS vote_score,
				CAST(
					CASE 
						WHEN @requesting_user_id IS NOT NULL AND EXISTS (
							SELECT 1 FROM [dbo].[post_vote] pv
							WHERE pv.post_id = p.id AND pv.user_id = @requesting_user_id AND pv.value = 1
						) THEN 1 ELSE 0 END AS BIT
				) AS liked_by_requesting_user,
				CAST(
					CASE 
						WHEN @requesting_user_id IS NOT NULL AND EXISTS (
							SELECT 1 FROM [dbo].[post_vote] pv
							WHERE pv.post_id = p.id AND pv.user_id = @requesting_user_id AND pv.value = -1
						) THEN 1 ELSE 0 END AS BIT
				) AS disliked_by_requesting_user
			FROM [dbo].[post] p
			LEFT JOIN [dbo].[app_user] u ON p.author_id = u.id
			LEFT JOIN [dbo].[category] c ON p.category_id = c.id
			WHERE p.deleted_at IS NULL
		), Ranked AS (
			SELECT 
				*,
				ROW_NUMBER() OVER (
					PARTITION BY category_id 
					ORDER BY (vote_count + comment_count) DESC, created_at DESC, id DESC
				) AS rn
			FROM Base
		)
		SELECT 
			id,
			title,
			body_md,
			url,
			created_at,
			updated_at,
			author_name,
			author_id,
			category_label,
			category_color,
			category_id,
			attachments,
			minutes_since_posted,
			comment_count,
			vote_count,
			vote_score,
			liked_by_requesting_user,
			disliked_by_requesting_user
		FROM Ranked
		WHERE rn = 1
		ORDER BY category_label ASC, category_id ASC`;

	const request = pool.request();
	request.input(
		'requesting_user_id',
		sql.UniqueIdentifier,
		requesting_user_id ?? null
	);

	const result = await request.query(query);
	return result.recordset.map((row: PostRow) => ({
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
		.input('mime_type', mime_type).query(`
      INSERT INTO [dbo].[attachment] (post_id, url, mime_type)
      OUTPUT INSERTED.*
      VALUES (@post_id, @url, @mime_type)
    `);
	return result.recordset[0];
};

export const clearAttachmentsByPost = async (post_id: string) => {
	const pool = await getDbConnection();
	await pool.request().input('post_id', sql.UniqueIdentifier, post_id).query(`
	  DELETE FROM [dbo].[attachment]
	  WHERE post_id = @post_id
	`);
};

export const deletePost = async (post_id: string, user_id?: string) => {
	const pool = await getDbConnection();
	let query = `
    UPDATE [dbo].[post]
    SET deleted_at = GETDATE()
    OUTPUT INSERTED.*
    WHERE id = @post_id AND deleted_at IS NULL
  `;

	const request = pool
		.request()
		.input('post_id', sql.UniqueIdentifier, post_id);

	if (user_id) {
		// If not admin → check if user is the post owner
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
	category_id?: string | null
) => {
	const pool = await getDbConnection();

	// Overwrite semantics: title and body_md must be provided by controller
	// category_id can be null to clear, or a UUID string to set; when omitted, controller passes null to clear
	const request = pool
		.request()
		.input('post_id', sql.UniqueIdentifier, post_id)
		.input('author_id', sql.UniqueIdentifier, author_id)
		.input('title', title ?? null)
		.input('body_md', body_md ?? null)
		// Bind category_id explicitly as UniqueIdentifier (nullable)
		.input('category_id', sql.UniqueIdentifier, category_id ?? null);

	const result = await request.query(`
			UPDATE [dbo].[post]
			SET 
				title = @title,
				body_md = @body_md,
				category_id = @category_id,
				updated_at = GETDATE()
			OUTPUT INSERTED.*
			WHERE id = @post_id AND author_id = @author_id AND deleted_at IS NULL
		`);

	return result.recordset[0];
};

export const getCategorySummaryStats = async () => {
	const pool = await getDbConnection();
	const query = `
			SELECT 
				c.id AS category_id,
				c.label AS category_label,
				c.color_hex AS category_color,
				ISNULL((
					SELECT COUNT(*)
					FROM [dbo].[post] pcount
					WHERE pcount.deleted_at IS NULL
						AND pcount.category_id = c.id
				), 0) AS post_count,
				ISNULL((
					SELECT COUNT(*)
					FROM [dbo].[post_vote] pv
					INNER JOIN [dbo].[post] p ON pv.post_id = p.id
					WHERE p.deleted_at IS NULL
						AND p.category_id = c.id
						AND pv.value IN (1,-1)
				), 0) AS total_vote_count,
				ISNULL((
					SELECT COUNT(*)
					FROM [dbo].[comment] cm
					INNER JOIN [dbo].[post] p2 ON cm.post_id = p2.id
					WHERE p2.deleted_at IS NULL
						AND p2.category_id = c.id
						AND cm.deleted_at IS NULL
				), 0) AS total_comment,
				(
					ISNULL((
						SELECT COUNT(*)
						FROM [dbo].[post_vote] pv
						INNER JOIN [dbo].[post] p ON pv.post_id = p.id
						WHERE p.deleted_at IS NULL
							AND p.category_id = c.id
							AND pv.value IN (1,-1)
					), 0)
					+
					ISNULL((
						SELECT COUNT(*)
						FROM [dbo].[comment] cm
						INNER JOIN [dbo].[post] p2 ON cm.post_id = p2.id
						WHERE p2.deleted_at IS NULL
							AND p2.category_id = c.id
							AND cm.deleted_at IS NULL
					), 0)
				) AS total_engagement
			FROM [dbo].[category] c
			ORDER BY c.label ASC, c.id ASC
		`;

	const result = (await (
		await pool.request().query(query)
	).recordset) as CategorySummaryRow[];
	return result;
};
