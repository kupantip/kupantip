import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export type ReportTarget = 'post' | 'comment' | 'user';
export type ReportStatus = 'open' | 'dismissed' | 'actioned';

export interface ReportRow {
	id: string;
	target_type: ReportTarget;
	target_id: string;
	reporter_id: string;
	reason: string;
	created_at: Date;
	status: ReportStatus;
}

export const createReport = async (params: {
	target_type: ReportTarget;
	target_id: string;
	reporter_id: string;
	reason: string;
}): Promise<ReportRow> => {
	const pool = await getDbConnection();

	// Optional: ensure target exists when target_type is post/comment
	if (params.target_type === 'post') {
		const exists = await pool
			.request()
			.input('id', sql.UniqueIdentifier, params.target_id)
			.query(
				`SELECT 1 FROM [dbo].[post] WHERE id=@id AND deleted_at IS NULL`
			);
		if (exists.recordset.length === 0) throw new Error('POST_NOT_FOUND');
	} else if (params.target_type === 'comment') {
		const exists = await pool
			.request()
			.input('id', sql.UniqueIdentifier, params.target_id)
			.query(
				`SELECT 1 FROM [dbo].[comment] WHERE id=@id AND deleted_at IS NULL`
			);
		if (exists.recordset.length === 0) throw new Error('COMMENT_NOT_FOUND');
	}

	const result = await pool
		.request()
		.input('target_type', sql.VarChar, params.target_type)
		.input('target_id', sql.UniqueIdentifier, params.target_id)
		.input('reporter_id', sql.UniqueIdentifier, params.reporter_id)
		.input('reason', sql.NVarChar, params.reason).query(`
      INSERT INTO [dbo].[report] (target_type, target_id, reporter_id, reason, status, created_at)
      OUTPUT INSERTED.*
      VALUES (@target_type, @target_id, @reporter_id, @reason, 'open', GETDATE())
    `);
	return result.recordset[0] as ReportRow;
};

export const listReports = async (filters: {
	status?: ReportStatus | null;
	target_type?: ReportTarget | null;
	report_id?: string | null;
	target_id?: string | null;
	reporter_id?: string | null;
	oldest_first?: boolean;
}): Promise<ReportRow[]> => {
	const pool = await getDbConnection();

	const req = pool.request();

	req.input('status', sql.VarChar, filters.status);
	req.input('target_type', sql.VarChar, filters.target_type);
	req.input('report_id', sql.UniqueIdentifier, filters.report_id);
	req.input('target_id', sql.UniqueIdentifier, filters.target_id);
	req.input('reporter_id', sql.UniqueIdentifier, filters.reporter_id);
	const orderDir = filters.oldest_first ? 'ASC' : 'DESC';
	const rows = await req.query(`
	SELECT r.id, r.target_type, r.target_id, r.reporter_id, r.reason, r.created_at, r.status,
	DATEDIFF(minute, r.created_at, GETDATE()) AS minutes_since_reported
	FROM [dbo].[report] r
	where r.status = COALESCE(@status, r.status)
	and r.target_type = COALESCE(@target_type, r.target_type)
	and r.id = COALESCE(@report_id, r.id)
	and r.target_id = COALESCE(@target_id, r.target_id)
	and r.reporter_id = COALESCE(@reporter_id, r.reporter_id )
		ORDER BY r.created_at ${orderDir}
  `);

	return rows.recordset as ReportRow[];
};

export const updateReportStatus = async (id: string, status: ReportStatus) => {
	const pool = await getDbConnection();
	const res = await pool
		.request()
		.input('id', sql.UniqueIdentifier, id)
		.input('status', sql.VarChar, status).query(`
      UPDATE [dbo].[report] SET status=@status WHERE id=@id;
      SELECT id, target_type, target_id, reporter_id, reason, created_at, status FROM [dbo].[report] WHERE id=@id;
    `);
	if (res.recordset.length === 0) throw new Error('REPORT_NOT_FOUND');
	return res.recordset[0] as ReportRow;
};

export interface ReportSummary {
	total_reports: number;
	by_status: {
		open: number;
		dismissed: number;
		actioned: number;
	};
	by_target_type: {
		post: number;
		comment: number;
		user: number;
	};
}

export const getReportsSummary = async (): Promise<ReportSummary> => {
	const pool = await getDbConnection();

	const result = await pool.request().query(`
		SELECT 
			COUNT(*) as total_reports,
			SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
			SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) as dismissed_count,
			SUM(CASE WHEN status = 'actioned' THEN 1 ELSE 0 END) as actioned_count,
			SUM(CASE WHEN target_type = 'post' THEN 1 ELSE 0 END) as post_count,
			SUM(CASE WHEN target_type = 'comment' THEN 1 ELSE 0 END) as comment_count,
			SUM(CASE WHEN target_type = 'user' THEN 1 ELSE 0 END) as user_count
		FROM [dbo].[report]
	`);

	const row = result.recordset[0];

	return {
		total_reports: row.total_reports,
		by_status: {
			open: row.open_count,
			dismissed: row.dismissed_count,
			actioned: row.actioned_count,
		},
		by_target_type: {
			post: row.post_count,
			comment: row.comment_count,
			user: row.user_count,
		},
	};
};
