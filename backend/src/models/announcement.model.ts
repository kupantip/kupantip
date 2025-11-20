import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export type AnnouncementRow = {
	id: string;
	author_id: string;
	title: string;
	body_md: string;
	create_at: Date;
	start_at: Date;
	end_at: Date;
	delete_at: Date | null;
	author_handle: string;
	author_display_name: string;
	author_role: string;
	minutes_since_announced: number;
};

export type CreateAnnouncementInput = {
	author_id: string;
	title: string;
	body_md: string;
	start_at: Date;
	end_at: Date;
};

export const createAnnouncement = async (
	input: CreateAnnouncementInput
): Promise<AnnouncementRow> => {
	const pool = await getDbConnection();
	const request = pool.request();

	request.input('author_id', sql.UniqueIdentifier, input.author_id);
	request.input('title', sql.NVarChar(300), input.title);
	request.input('body_md', sql.NVarChar(sql.MAX), input.body_md);
	request.input('start_at', sql.DateTime, input.start_at);
	request.input('end_at', sql.DateTime, input.end_at);

	const result = await request.query(`
		INSERT INTO [dbo].[announcement] (author_id, title, body_md, start_at, end_at)
		OUTPUT INSERTED.*
		VALUES (@author_id, @title, @body_md, @start_at, @end_at)
	`);

	return result.recordset[0];
};

export const getActiveAnnouncements = async (): Promise<AnnouncementRow[]> => {
	const pool = await getDbConnection();
	const request = pool.request();

	const result = await request.query(`
		SELECT 
			a.id,
			a.author_id,
			a.title,
			a.body_md,
			a.create_at,
			a.start_at,
			a.end_at,
			a.delete_at,
			u.handle AS author_handle,
			u.display_name AS author_display_name,
			ur.role AS author_role,
			DATEDIFF(MINUTE, a.start_at, GETDATE()) AS minutes_since_announced
		FROM [dbo].[announcement] a
		LEFT JOIN [dbo].[app_user] u ON a.author_id = u.id
		LEFT JOIN [dbo].[user_role] ur ON u.id = ur.user_id
		WHERE 
			a.delete_at IS NULL
			AND GETDATE() >= a.start_at
			AND GETDATE() <= a.end_at
		ORDER BY a.start_at DESC
	`);

	return result.recordset;
};

export const getAnnouncementById = async (
	announcement_id: string
): Promise<AnnouncementRow | null> => {
	const pool = await getDbConnection();
	const request = pool.request();

	request.input('announcement_id', sql.UniqueIdentifier, announcement_id);

	const result = await request.query(`
		SELECT 
			a.id,
			a.author_id,
			a.title,
			a.body_md,
			a.create_at,
			a.start_at,
			a.end_at,
			a.delete_at,
			u.handle AS author_handle,
			u.display_name AS author_display_name,
			ur.role AS author_role,
			DATEDIFF(MINUTE, a.start_at, GETDATE()) AS minutes_since_announced
		FROM [dbo].[announcement] a
		LEFT JOIN [dbo].[app_user] u ON a.author_id = u.id
		LEFT JOIN [dbo].[user_role] ur ON u.id = ur.user_id
		WHERE a.id = @announcement_id AND a.delete_at IS NULL
	`);

	return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const deleteAnnouncement = async (
	announcement_id: string
): Promise<boolean> => {
	const pool = await getDbConnection();
	const request = pool.request();

	request.input('announcement_id', sql.UniqueIdentifier, announcement_id);

	const result = await request.query(`
		UPDATE [dbo].[announcement]
		SET delete_at = GETDATE()
		WHERE id = @announcement_id AND delete_at IS NULL
	`);

	return result.rowsAffected[0] > 0;
};

export const getAllAnnouncementsOrderedByStartDate = async (): Promise<
	AnnouncementRow[]
> => {
	const pool = await getDbConnection();
	const request = pool.request();

	const result = await request.query(`
		SELECT 
			a.id,
			a.author_id,
			a.title,
			a.body_md,
			a.create_at,
			a.start_at,
			a.end_at,
			a.delete_at,
			u.handle AS author_handle,
			u.display_name AS author_display_name,
			ur.role AS author_role,
			DATEDIFF(MINUTE, a.start_at, GETDATE()) AS minutes_since_announced
		FROM [dbo].[announcement] a
		LEFT JOIN [dbo].[app_user] u ON a.author_id = u.id
		LEFT JOIN [dbo].[user_role] ur ON u.id = ur.user_id
		WHERE a.delete_at IS NULL
		ORDER BY a.start_at ASC
	`);

	return result.recordset;
};
