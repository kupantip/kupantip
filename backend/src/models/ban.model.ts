import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export type BanType =
	| 'suspend'
	| 'post_ban'
	| 'comment_ban'
	| 'vote_ban'
	| 'shadowban';

export type BanRow = {
	id: string;
	user_id: string;
	ban_type: BanType;
	reason_admin: string | null;
	reason_user: string | null;
	start_at: Date;
	end_at: Date | null;
	created_by: string | null;
	created_at: Date;
	revoked_at: Date | null;
	revoked_by: string | null;
	related_report_id: string | null;
};

export type CreateBanInput = {
	user_id: string;
	ban_type: BanType;
	reason_admin?: string;
	reason_user?: string;
	start_at?: Date;
	end_at?: Date | null;
	created_by: string;
	related_report_id?: string;
};

export type BanFilters = {
	ban_id?: string;
	user_id?: string;
	ban_type?: BanType;
	status?: 'active' | 'scheduled' | 'expired' | 'revoked';
	created_by?: string;
	related_report_id?: string;
	start_date?: Date;
	end_date?: Date;
};

export const createBan = async (input: CreateBanInput): Promise<BanRow> => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('user_id', sql.UniqueIdentifier, input.user_id)
		.input('ban_type', sql.NVarChar(32), input.ban_type)
		.input(
			'reason_admin',
			sql.NVarChar(sql.MAX),
			input.reason_admin ?? null
		)
		.input('reason_user', sql.NVarChar(512), input.reason_user ?? null)
		.input('start_at', sql.DateTime, input.start_at ?? null)
		.input('end_at', sql.DateTime, input.end_at ?? null)
		.input('created_by', sql.UniqueIdentifier, input.created_by)
		.input(
			'related_report_id',
			sql.UniqueIdentifier,
			input.related_report_id ?? null
		).query(`
      INSERT INTO [dbo].[user_ban] 
        (user_id, ban_type, reason_admin, reason_user, start_at, end_at, created_by, related_report_id)
      OUTPUT INSERTED.*
      VALUES (@user_id, @ban_type, @reason_admin, @reason_user, 
              ISNULL(@start_at, GETDATE()), @end_at, @created_by, @related_report_id)
    `);

	return result.recordset[0];
};

export const getBans = async (filters: BanFilters = {}): Promise<BanRow[]> => {
	const pool = await getDbConnection();
	const request = pool.request();

	// Bind all parameters
	request.input('ban_id', sql.UniqueIdentifier, filters.ban_id ?? null);
	request.input('user_id', sql.UniqueIdentifier, filters.user_id ?? null);
	request.input('ban_type', sql.NVarChar(32), filters.ban_type ?? null);
	request.input(
		'created_by',
		sql.UniqueIdentifier,
		filters.created_by ?? null
	);
	request.input(
		'related_report_id',
		sql.UniqueIdentifier,
		filters.related_report_id ?? null
	);
	request.input('start_date', sql.DateTime, filters.start_date ?? null);
	request.input('end_date', sql.DateTime, filters.end_date ?? null);
	request.input('now', sql.DateTime, new Date());

	// Build status filter using CASE
	let statusFilter = '1=1';
	if (filters.status === 'active') {
		statusFilter = `ub.revoked_at IS NULL 
                    AND ub.start_at <= @now 
                    AND (ub.end_at IS NULL OR ub.end_at > @now)`;
	} else if (filters.status === 'scheduled') {
		statusFilter = 'ub.revoked_at IS NULL AND ub.start_at > @now';
	} else if (filters.status === 'expired') {
		statusFilter =
			'ub.revoked_at IS NULL AND ub.end_at IS NOT NULL AND ub.end_at <= @now';
	} else if (filters.status === 'revoked') {
		statusFilter = 'ub.revoked_at IS NOT NULL';
	}

	const result = await request.query(`
    SELECT 
      ub.*,
      u.handle as banned_user_handle_name,
      u.display_name as banned_user_name,
      u.email as banned_user_email,
      creator.handle as creator_handle_name,
      creator.display_name as creator_name,
      creator.email as creator_email,
      revoker.handle as revoker_handle_name,
      revoker.display_name as revoker_name,
      revoker.email as revoker_email
    FROM [dbo].[user_ban] ub
    LEFT JOIN [dbo].[app_user] u ON ub.user_id = u.id
    LEFT JOIN [dbo].[app_user] creator ON ub.created_by = creator.id
    LEFT JOIN [dbo].[app_user] revoker ON ub.revoked_by = revoker.id
    WHERE (ISNULL(@ban_id, ub.id) = ub.id)
      AND (ISNULL(@user_id, ub.user_id) = ub.user_id)
      AND (ISNULL(@ban_type, ub.ban_type) = ub.ban_type)
      AND (ISNULL(@created_by, ub.created_by) = ub.created_by)
      AND (ISNULL(@related_report_id, ub.related_report_id) = ub.related_report_id)
      AND (ISNULL(@start_date, ub.start_at) <= ub.start_at)
      AND (ub.start_at <= ISNULL(@end_date, ub.start_at))
      AND (${statusFilter})
    ORDER BY ub.created_at DESC
  `);

	return result.recordset;
};

export const updateBan = async (
	ban_id: string,
	updates: {
		ban_type?: BanType;
		reason_admin?: string;
		reason_user?: string;
		end_at?: Date | null;
	}
): Promise<BanRow | null> => {
	const pool = await getDbConnection();

	// Build SET clause dynamically based on provided fields
	const setFields: string[] = [];
	const request = pool
		.request()
		.input('ban_id', sql.UniqueIdentifier, ban_id);

	if ('ban_type' in updates) {
		setFields.push('ban_type = @ban_type');
		request.input('ban_type', sql.NVarChar(32), updates.ban_type);
	}

	if ('reason_admin' in updates) {
		setFields.push('reason_admin = @reason_admin');
		request.input(
			'reason_admin',
			sql.NVarChar(sql.MAX),
			updates.reason_admin
		);
	}

	if ('reason_user' in updates) {
		setFields.push('reason_user = @reason_user');
		request.input('reason_user', sql.NVarChar(512), updates.reason_user);
	}

	if ('end_at' in updates) {
		setFields.push('end_at = @end_at');
		request.input('end_at', sql.DateTime, updates.end_at);
	}

	if (setFields.length === 0) {
		return null;
	}

	const result = await request.query(`
    UPDATE [dbo].[user_ban]
    SET ${setFields.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @ban_id AND revoked_at IS NULL
  `);

	return result.recordset[0] || null;
};

export const revokeBan = async (
	ban_id: string,
	revoked_by: string,
	reason_admin?: string
): Promise<BanRow | null> => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('ban_id', sql.UniqueIdentifier, ban_id)
		.input('revoked_by', sql.UniqueIdentifier, revoked_by)
		.input('reason_admin', sql.NVarChar(sql.MAX), reason_admin ?? null)
		.query(`
    UPDATE [dbo].[user_ban]
    SET 
      revoked_at = GETDATE(),
      revoked_by = @revoked_by,
      reason_admin = COALESCE(@reason_admin, reason_admin)
    OUTPUT INSERTED.*
    WHERE id = @ban_id AND revoked_at IS NULL
  `);

	return result.recordset[0] || null;
};

export const getUserActiveBans = async (
	user_id: string,
	ban_type?: BanType
): Promise<BanRow[]> => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('user_id', sql.UniqueIdentifier, user_id)
		.input('ban_type', sql.NVarChar(32), ban_type ?? null).query(`
    SELECT *
    FROM [dbo].[user_ban]
    WHERE user_id = @user_id
      AND revoked_at IS NULL
      AND start_at <= GETDATE()
      AND (end_at IS NULL OR end_at > GETDATE())
      AND (ISNULL(@ban_type, ban_type) = ban_type)
    ORDER BY created_at DESC
  `);

	return result.recordset;
};
