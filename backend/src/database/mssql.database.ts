import sql from 'mssql';
import '../config/env';

const sqlConfig = {
	user: process.env.SQL_USER ?? '',
	password: process.env.SQL_PASSWORD ?? '',
	server: process.env.SQL_SERVER ?? '',
	database: process.env.SQL_NAME ?? '',
	port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : 1433,
	requestTimeout: 60000,
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000,
	},
	options: {
		encrypt: false,
		enableArithAbort: true,
		trustServerCertificate: true,
		connectTimeout: 5000,
	},
};

let pool: sql.ConnectionPool;

const getDbConnection = async (): Promise<sql.ConnectionPool> => {
	if (!pool) {
		pool = await sql.connect(sqlConfig);
	}
	return pool;
};

export { getDbConnection };
