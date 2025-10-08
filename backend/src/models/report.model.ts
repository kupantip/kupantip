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
	status?: ReportStatus;
	target_type?: ReportTarget;
	report_id?: string;
	target_id?: string;
	reporter_id?: string;
	oldest_first?: boolean;
}): Promise<ReportRow[]> => {
	const pool = await getDbConnection();

	const req = pool.request();

	const where: string[] = [];
	if (filters.status) {
		where.push('r.status = @status');
		req.input('status', sql.VarChar, filters.status);
	}
	if (filters.target_type) {
		where.push('r.target_type = @target_type');
		req.input('target_type', sql.VarChar, filters.target_type);
	}
	if (filters.report_id) {
		where.push('r.id = @report_id');
		req.input('report_id', sql.UniqueIdentifier, filters.report_id);
	}
	if (filters.target_id) {
		where.push('r.target_id = @target_id');
		req.input('target_id', sql.UniqueIdentifier, filters.target_id);
	}
	if (filters.reporter_id) {
		where.push('r.reporter_id = @reporter_id');
		req.input('reporter_id', sql.UniqueIdentifier, filters.reporter_id);
	}
	const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
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
