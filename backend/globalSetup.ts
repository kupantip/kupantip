// globalSetup.ts
import { MSSQLServerContainer } from '@testcontainers/mssqlserver';
import { execSync } from 'child_process';

// This is an async function that Jest will run once
export default async () => {
	console.log('Starting MSSQL container...');
	const container = await new MSSQLServerContainer(
		'mcr.microsoft.com/mssql/server:2022-CU13-ubuntu-22.04'
	).start();
	console.log('Container started.');

	// Set all the environment variables
	const SQL_USER = container.getUsername();
	const SQL_PASSWORD = container.getPassword();
	const SQL_SERVER = container.getHost();
	const SQL_PORT = container.getMappedPort(1433).toString();
	const SQL_NAME = 'pantip_db';

	process.env.SQL_USER = SQL_USER;
	process.env.SQL_PASSWORD = SQL_PASSWORD;
	process.env.SQL_SERVER = SQL_SERVER;
	process.env.SQL_PORT = SQL_PORT;
	process.env.SQL_NAME = SQL_NAME;
	process.env.DATABASE_URL = `sqlserver://${SQL_SERVER}:${SQL_PORT};database=${SQL_NAME};user=${SQL_USER};password=${SQL_PASSWORD};encrypt=true;trustServerCertificate=true`;

	// Set other envs your app needs
	process.env.JWT_SECRET = 'jesusloveme';
	process.env.JWT_EXPIRES_IN = '7d';
	process.env.PORT = '8000';

	console.log('Env set up complete.');

	// Run migrations (passing the new env vars)
	console.log('Resetting and migrating database...');
	execSync('npx prisma migrate reset --force', {
		stdio: 'inherit',
		env: { ...process.env }, // Pass the new env vars
	});
	console.log('Database migration complete.');

	// Save the container reference so we can stop it later
	global.__TEST_CONTAINER__ = container;
};
