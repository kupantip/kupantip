import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export type TargetType = 'user' | 'post' | 'comment' | 'report';

export type ActionType =
	| 'ban_create'
	| 'ban_update'
	| 'ban_revoke'
	| 'report_action'
	| 'delete_content';

export type ModerationActionRow = {
	id: string;
	actor_id: string;
	target_type: TargetType;
	target_id: string;
	action_type: ActionType;
	details: string | null;
	created_at: Date;
};

export type CreateModerationActionInput = {
	actor_id: string;
	target_type: TargetType;
	target_id: string;
	action_type: ActionType;
	details?: string | Record<string, unknown>;
};

export type ModerationActionFilters = {
	actor_id?: string;
	target_type?: TargetType;
	target_id?: string;
	action_type?: ActionType;
	start_date?: Date;
	end_date?: Date;
	recent?: boolean;
};

/**
 * Log a moderation action for audit trail
 */
export const logModerationAction = async (
	input: CreateModerationActionInput
): Promise<ModerationActionRow> => {
	const pool = await getDbConnection();

	// Serialize details if it's an object
	const detailsString =
		typeof input.details === 'object'
			? JSON.stringify(input.details)
			: (input.details ?? null);

	const result = await pool
		.request()
		.input('actor_id', sql.UniqueIdentifier, input.actor_id)
		.input('target_type', sql.NVarChar(16), input.target_type)
		.input('target_id', sql.UniqueIdentifier, input.target_id)
		.input('action_type', sql.NVarChar(32), input.action_type)
		.input('details', sql.NVarChar(sql.MAX), detailsString).query(`
      INSERT INTO [dbo].[moderation_action]
        (actor_id, target_type, target_id, action_type, details)
      OUTPUT INSERTED.*
      VALUES (@actor_id, @target_type, @target_id, @action_type, @details)
    `);

	return result.recordset[0];
};

/**
 * Get moderation actions with optional filtering
 */
export const getModerationActions = async (
	filters: ModerationActionFilters = {}
): Promise<ModerationActionRow[]> => {
	const pool = await getDbConnection();
	const request = pool.request();

	// Bind all filter parameters
	request.input('actor_id', sql.UniqueIdentifier, filters.actor_id ?? null);
	request.input('target_type', sql.NVarChar(16), filters.target_type ?? null);
	request.input('target_id', sql.UniqueIdentifier, filters.target_id ?? null);
	request.input('action_type', sql.NVarChar(32), filters.action_type ?? null);
	request.input('start_date', sql.DateTime, filters.start_date ?? null);
	request.input('end_date', sql.DateTime, filters.end_date ?? null);

	// Determine sort order based on recent flag (default: recent DESC)
	const orderBy =
		filters.recent === false
			? 'ORDER BY ma.created_at ASC'
			: 'ORDER BY ma.created_at DESC';

	const result = await request.query(`
    SELECT 
      ma.*,
      u.handle as actor_handle,
      u.display_name as actor_name,
      u.email as actor_email
    FROM [dbo].[moderation_action] ma
    LEFT JOIN [dbo].[app_user] u ON ma.actor_id = u.id
    WHERE (COALESCE(@actor_id, ma.actor_id) = ma.actor_id)
      AND (COALESCE(@target_type, ma.target_type) = ma.target_type)
      AND (COALESCE(@target_id, ma.target_id) = ma.target_id)
      AND (COALESCE(@action_type, ma.action_type) = ma.action_type)
      AND (COALESCE(@start_date, ma.created_at) <= ma.created_at)
      AND (ma.created_at <= COALESCE(@end_date, ma.created_at))
    ${orderBy}
  `);

	return result.recordset;
};
