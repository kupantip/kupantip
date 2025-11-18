import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export type PostSearchResult = {
	id: string;
	title: string;
	body_md: string;
	author_name: string;
	author_id: string;
	category_label: string | null;
	category_color: string | null;
	category_id: string | null;
	minutes_since_posted: number;
	comment_count: number;
	like_count: number;
	dislike_count: number;
	vote_count: number;
	vote_score: number;
	liked_by_requesting_user: boolean;
	disliked_by_requesting_user: boolean;
	created_at: Date;
	relevance_score: number;
	attachments: string;
};

export type CommentSearchResult = {
	id: string;
	body_md: string;
	post_id: string;
	post_title: string;
	post_author_name: string;
	post_vote_score: number;
	post_comment_count: number;
	post_minutes_since_posted: number;
	author_name: string;
	author_id: string;
	minutes_since_commented: number;
	reply_count: number;
	like_count: number;
	dislike_count: number;
	vote_count: number;
	vote_score: number;
	liked_by_requesting_user: boolean;
	disliked_by_requesting_user: boolean;
	created_at: Date;
	relevance_score: number;
};

export type UserSearchResult = {
	id: string;
	handle: string;
	display_name: string;
	created_at: Date;
	relevance_score: number;
};

export type CategorySearchResult = {
	id: string;
	label: string;
	color_hex: string | null;
	detail: string | null;
	relevance_score: number;
};

export type SearchResult = {
	posts?: PostSearchResult[];
	comments?: CommentSearchResult[];
	users?: UserSearchResult[];
	categories?: CategorySearchResult[];
};

export const search = async (
	query: string,
	type: string,
	limit: number,
	requesting_user_id?: string
): Promise<SearchResult> => {
	const pool = await getDbConnection();
	const result: SearchResult = {};

	// Prepare queries to run in parallel
	const queries: Promise<void>[] = [];

	// Search Posts
	if (type === 'post' || type === 'all') {
		queries.push(
			pool
				.request()
				.input('query', sql.NVarChar, `%${query}%`)
				.input('exact_query', sql.NVarChar, query)
				.input('limit', sql.Int, limit)
				.input(
					'requesting_user_id',
					sql.UniqueIdentifier,
					requesting_user_id || null
				)
				.query(
					`
					SELECT TOP (@limit)
						p.id, 
						p.title, 
						p.body_md,
						p.author_id,
						u.display_name AS author_name,
					p.category_id,
					c.label AS category_label,
					c.color_hex AS category_color,
					(
						SELECT a.id, a.url, a.mime_type
						FROM [dbo].[attachment] a WITH (NOLOCK)
						WHERE a.post_id = p.id
						FOR JSON PATH
					) AS attachments,
					DATEDIFF(MINUTE, p.created_at, GETDATE()) AS minutes_since_posted,
						(SELECT COUNT(*) FROM [dbo].[comment] WITH (NOLOCK) WHERE post_id = p.id AND deleted_at IS NULL) AS comment_count,
						(SELECT COUNT(*) FROM [dbo].[post_vote] WITH (NOLOCK) WHERE post_id = p.id AND value = 1) AS like_count,
						(SELECT COUNT(*) FROM [dbo].[post_vote] WITH (NOLOCK) WHERE post_id = p.id AND value = -1) AS dislike_count,
						(SELECT COUNT(*) FROM [dbo].[post_vote] WITH (NOLOCK) WHERE post_id = p.id) AS vote_count,
						(SELECT 
							COUNT(CASE WHEN value = 1 THEN 1 END) - COUNT(CASE WHEN value = -1 THEN 1 END)
							FROM [dbo].[post_vote] WITH (NOLOCK) 
							WHERE post_id = p.id
						) AS vote_score,
						CAST(CASE WHEN EXISTS(
							SELECT 1 FROM [dbo].[post_vote] WITH (NOLOCK) 
							WHERE post_id = p.id AND user_id = @requesting_user_id AND value = 1
						) THEN 1 ELSE 0 END AS BIT) AS liked_by_requesting_user,
						CAST(CASE WHEN EXISTS(
							SELECT 1 FROM [dbo].[post_vote] WITH (NOLOCK) 
							WHERE post_id = p.id AND user_id = @requesting_user_id AND value = -1
						) THEN 1 ELSE 0 END AS BIT) AS disliked_by_requesting_user,
						p.created_at,
						(CASE 
							WHEN p.title = @exact_query THEN 1000
							WHEN p.title LIKE @exact_query + '%' THEN 500
							WHEN p.title LIKE @query THEN 100
							ELSE 0
						END +
						CASE 
							WHEN p.body_md LIKE '%' + @exact_query + '%' THEN 50
							WHEN p.body_md LIKE @query THEN 10
							ELSE 0
						END) AS relevance_score
				FROM [dbo].[post] p WITH (NOLOCK)
				LEFT JOIN [dbo].[app_user] u WITH (NOLOCK) ON p.author_id = u.id
				LEFT JOIN [dbo].[category] c WITH (NOLOCK) ON p.category_id = c.id
				WHERE p.deleted_at IS NULL
						AND (p.title LIKE @query OR p.body_md LIKE @query)
					ORDER BY 
						CASE 
							WHEN p.title = @exact_query THEN 1000
							WHEN p.title LIKE @exact_query + '%' THEN 500
							WHEN p.title LIKE @query THEN 100
							ELSE 0
						END +
						CASE 
							WHEN p.body_md LIKE '%' + @exact_query + '%' THEN 50
							WHEN p.body_md LIKE @query THEN 10
							ELSE 0
						END DESC,
					p.created_at DESC
			`
				)
				.then((res) => {
					// Parse attachments JSON string to array
					result.posts = res.recordset.map(
						(row: PostSearchResult) => ({
							...row,
							attachments: row.attachments
								? JSON.parse(row.attachments)
								: [],
						})
					);
				})
		);
	} // Search Comments
	if (type === 'comment' || type === 'all') {
		queries.push(
			pool
				.request()
				.input('query', sql.NVarChar, `%${query}%`)
				.input('exact_query', sql.NVarChar, query)
				.input('limit', sql.Int, limit)
				.input(
					'requesting_user_id',
					sql.UniqueIdentifier,
					requesting_user_id || null
				)
				.query(
					`
					SELECT TOP (@limit)
						c.id,
						c.body_md,
						c.post_id,
						c.author_id,
						p.title AS post_title,
						post_author.display_name AS post_author_name,
						DATEDIFF(MINUTE, p.created_at, GETDATE()) AS post_minutes_since_posted,
						(SELECT COUNT(*) FROM [dbo].[comment] WITH (NOLOCK) WHERE post_id = p.id AND deleted_at IS NULL) AS post_comment_count,
						(SELECT 
							COUNT(CASE WHEN value = 1 THEN 1 END) - COUNT(CASE WHEN value = -1 THEN 1 END)
							FROM [dbo].[post_vote] WITH (NOLOCK) 
							WHERE post_id = p.id
						) AS post_vote_score,
						u.display_name AS author_name,
						DATEDIFF(MINUTE, c.created_at, GETDATE()) AS minutes_since_commented,
						(SELECT COUNT(*) FROM [dbo].[comment] r WITH (NOLOCK) WHERE r.parent_id = c.id AND r.deleted_at IS NULL) AS reply_count,
						(SELECT COUNT(*) FROM [dbo].[comment_vote] WITH (NOLOCK) WHERE comment_id = c.id AND value = 1) AS like_count,
						(SELECT COUNT(*) FROM [dbo].[comment_vote] WITH (NOLOCK) WHERE comment_id = c.id AND value = -1) AS dislike_count,
						(SELECT COUNT(*) FROM [dbo].[comment_vote] WITH (NOLOCK) WHERE comment_id = c.id) AS vote_count,
						(SELECT 
							COUNT(CASE WHEN value = 1 THEN 1 END) - COUNT(CASE WHEN value = -1 THEN 1 END)
							FROM [dbo].[comment_vote] WITH (NOLOCK) 
							WHERE comment_id = c.id
						) AS vote_score,
						CAST(CASE WHEN EXISTS(
							SELECT 1 FROM [dbo].[comment_vote] WITH (NOLOCK) 
							WHERE comment_id = c.id AND user_id = @requesting_user_id AND value = 1
						) THEN 1 ELSE 0 END AS BIT) AS liked_by_requesting_user,
						CAST(CASE WHEN EXISTS(
							SELECT 1 FROM [dbo].[comment_vote] WITH (NOLOCK) 
							WHERE comment_id = c.id AND user_id = @requesting_user_id AND value = -1
						) THEN 1 ELSE 0 END AS BIT) AS disliked_by_requesting_user,
						c.created_at,
						(CASE 
							WHEN c.body_md LIKE @exact_query + '%' THEN 100
							WHEN c.body_md LIKE '%' + @exact_query + '%' THEN 50
							WHEN c.body_md LIKE @query THEN 10
							ELSE 0
						END) AS relevance_score
					FROM [dbo].[comment] c WITH (NOLOCK)
					LEFT JOIN [dbo].[app_user] u WITH (NOLOCK) ON c.author_id = u.id
					LEFT JOIN [dbo].[post] p WITH (NOLOCK) ON c.post_id = p.id
					LEFT JOIN [dbo].[app_user] post_author WITH (NOLOCK) ON p.author_id = post_author.id
					WHERE c.deleted_at IS NULL
						AND c.body_md LIKE @query
					ORDER BY 
						CASE 
							WHEN c.body_md LIKE @exact_query + '%' THEN 100
							WHEN c.body_md LIKE '%' + @exact_query + '%' THEN 50
							WHEN c.body_md LIKE @query THEN 10
							ELSE 0
						END DESC,
						c.created_at DESC
				`
				)
				.then((res) => {
					result.comments = res.recordset;
				})
		);
	}

	// Search Users
	if (type === 'user' || type === 'all') {
		queries.push(
			pool
				.request()
				.input('query', sql.NVarChar, `%${query}%`)
				.input('exact_query', sql.NVarChar, query)
				.input('limit', sql.Int, limit)
				.query(
					`
					SELECT TOP (@limit)
						id,
						handle,
						display_name,
						created_at,
						(CASE 
							WHEN handle = @exact_query THEN 1000
							WHEN display_name = @exact_query THEN 900
							WHEN handle LIKE @exact_query + '%' THEN 500
							WHEN display_name LIKE @exact_query + '%' THEN 400
							WHEN handle LIKE @query THEN 100
							WHEN display_name LIKE @query THEN 50
							ELSE 0
						END) AS relevance_score
					FROM [dbo].[app_user] WITH (NOLOCK)
					WHERE handle LIKE @query OR display_name LIKE @query
					ORDER BY 
						CASE 
							WHEN handle = @exact_query THEN 1000
							WHEN display_name = @exact_query THEN 900
							WHEN handle LIKE @exact_query + '%' THEN 500
							WHEN display_name LIKE @exact_query + '%' THEN 400
							WHEN handle LIKE @query THEN 100
							WHEN display_name LIKE @query THEN 50
							ELSE 0
						END DESC
				`
				)
				.then((res) => {
					result.users = res.recordset;
				})
		);
	}

	// Search Categories
	if (type === 'category' || type === 'all') {
		queries.push(
			pool
				.request()
				.input('query', sql.NVarChar, `%${query}%`)
				.input('exact_query', sql.NVarChar, query)
				.input('limit', sql.Int, limit)
				.query(
					`
					SELECT TOP (@limit)
						id,
						label,
						color_hex,
						detail,
						(CASE 
							WHEN label = @exact_query THEN 1000
							WHEN label LIKE @exact_query + '%' THEN 500
							WHEN label LIKE @query THEN 100
							WHEN detail LIKE '%' + @exact_query + '%' THEN 50
							WHEN detail LIKE @query THEN 10
							ELSE 0
						END) AS relevance_score
					FROM [dbo].[category] WITH (NOLOCK)
					WHERE label LIKE @query OR detail LIKE @query
					ORDER BY 
						CASE 
							WHEN label = @exact_query THEN 1000
							WHEN label LIKE @exact_query + '%' THEN 500
							WHEN label LIKE @query THEN 100
							WHEN detail LIKE '%' + @exact_query + '%' THEN 50
							WHEN detail LIKE @query THEN 10
							ELSE 0
						END DESC
				`
				)
				.then((res) => {
					result.categories = res.recordset;
				})
		);
	}

	// Execute all queries in parallel
	await Promise.all(queries);

	return result;
};
