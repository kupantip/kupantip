import 'dotenv/config';

export const env = {
	port: Number(process.env.PORT || 8000),
	jwtSecret: process.env.JWT_SECRET || '',
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
	dbServer: process.env.SQL_SERVER || '',
	dbUser: process.env.SQL_USER || '',
	dbPassword: process.env.SQL_PASSWORD || '',
	dbName: process.env.SQL_NAME || '',
	dbPort: Number(process.env.SQL_PORT || 1433),
};
