import { getDbConnection } from '../database/mssql.database';
import sql from 'mssql';

export interface UserStats {
	total: number;
	new_today: number;
	last_updated: Date;
}

export interface PostStats {
	total: number;
	new_today: number;
	last_updated: Date;
}

export interface CommentStats {
	total: number;
	new_today: number;
	last_updated: Date;
}

export interface ReportStats {
	total: number;
	new_today: number;
	last_updated: Date;
}

export interface DailyActivityData {
	date: string; // Format: YYYY-MM-DD
	count: number;
	day_label: string; // e.g., "Mon 6", "Tue 7"
}

export interface DailyPostActivity {
	data: DailyActivityData[];
	period_days: number;
	start_date: string;
	end_date: string;
}

export interface DailyReportActivity {
	data: DailyActivityData[];
	period_days: number;
	start_date: string;
	end_date: string;
}

export interface DashboardStats {
	users: UserStats;
	posts: PostStats;
	comments: CommentStats;
	reports: ReportStats;
}

export const getUserStats = async (): Promise<UserStats> => {
	const pool = await getDbConnection();

	const result = await pool.request().query(`
		SELECT 
			COUNT(*) as total,
			SUM(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as new_today,
			GETDATE() as last_updated
		FROM [dbo].[app_user]
	`);

	return result.recordset[0];
};

export const getPostStats = async (): Promise<PostStats> => {
	const pool = await getDbConnection();

	const result = await pool.request().query(`
		SELECT 
			COUNT(*) as total,
			SUM(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as new_today,
			GETDATE() as last_updated
		FROM [dbo].[post]
		WHERE deleted_at IS NULL
	`);

	return result.recordset[0];
};

export const getCommentStats = async (): Promise<CommentStats> => {
	const pool = await getDbConnection();

	const result = await pool.request().query(`
		SELECT 
			COUNT(*) as total,
			SUM(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as new_today,
			GETDATE() as last_updated
		FROM [dbo].[comment]
		WHERE deleted_at IS NULL
	`);

	return result.recordset[0];
};

export const getReportStats = async (): Promise<ReportStats> => {
	const pool = await getDbConnection();

	const result = await pool.request().query(`
		SELECT 
			COUNT(*) as total,
			SUM(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as new_today,
			GETDATE() as last_updated
		FROM [dbo].[report]
	`);

	return result.recordset[0];
};

export const getAllDashboardStats = async (): Promise<DashboardStats> => {
	const [users, posts, comments, reports] = await Promise.all([
		getUserStats(),
		getPostStats(),
		getCommentStats(),
		getReportStats(),
	]);

	return {
		users,
		posts,
		comments,
		reports,
	};
};

export const getDailyPostActivity = async (
	days: number = 7
): Promise<DailyPostActivity> => {
	const pool = await getDbConnection();

	const result = await pool.request().input('days', sql.Int, days).query(`
		WITH DateRange AS (
			SELECT CAST(DATEADD(day, -number, CAST(GETDATE() AS DATE)) AS DATE) AS date
			FROM master..spt_values
			WHERE type = 'P' AND number BETWEEN 0 AND @days - 1
		)
		SELECT 
			CONVERT(VARCHAR(10), dr.date, 23) AS date,
			COALESCE(COUNT(p.id), 0) AS count,
			DATENAME(dw, dr.date) + ' ' + CAST(DAY(dr.date) AS VARCHAR) AS day_label
		FROM DateRange dr
		LEFT JOIN [dbo].[post] p 
			ON CAST(p.created_at AS DATE) = dr.date 
		GROUP BY dr.date
		ORDER BY dr.date ASC
	`);

	const data = result.recordset.map((row) => ({
		date: row.date,
		count: row.count,
		day_label: row.day_label,
	}));

	return {
		data,
		period_days: days,
		start_date: data.length > 0 ? data[0].date : '',
		end_date: data.length > 0 ? data[data.length - 1].date : '',
	};
};

export const getDailyReportActivity = async (
	days: number = 7
): Promise<DailyReportActivity> => {
	const pool = await getDbConnection();

	const result = await pool.request().input('days', sql.Int, days).query(`
		WITH DateRange AS (
			SELECT CAST(DATEADD(day, -number, CAST(GETDATE() AS DATE)) AS DATE) AS date
			FROM master..spt_values
			WHERE type = 'P' AND number BETWEEN 0 AND @days - 1
		)
		SELECT 
			CONVERT(VARCHAR(10), dr.date, 23) AS date,
			COALESCE(COUNT(r.id), 0) AS count,
			DATENAME(dw, dr.date) + ' ' + CAST(DAY(dr.date) AS VARCHAR) AS day_label
		FROM DateRange dr
		LEFT JOIN [dbo].[report] r 
			ON CAST(r.created_at AS DATE) = dr.date
		GROUP BY dr.date
		ORDER BY dr.date ASC
	`);

	const data = result.recordset.map((row) => ({
		date: row.date,
		count: row.count,
		day_label: row.day_label,
	}));

	return {
		data,
		period_days: days,
		start_date: data.length > 0 ? data[0].date : '',
		end_date: data.length > 0 ? data[data.length - 1].date : '',
	};
};
