import {
	MSSQLServerContainer,
	StartedMSSQLServerContainer,
} from '@testcontainers/mssqlserver';
import { execSync } from 'child_process';
import { beforeAll, afterAll, jest } from '@jest/globals';
// Give container startup 2 minutes
jest.setTimeout(120000);

let mssqlContainer: StartedMSSQLServerContainer;

beforeAll(async () => {
	console.log('Starting MSSQL container...');
	mssqlContainer = await new MSSQLServerContainer(
		'mcr.microsoft.com/mssql/server:2022-CU13-ubuntu-22.04'
	).start();
	console.log('Container started.');

	console.log('Start set up env');
	const SQL_USER = mssqlContainer.getUsername();
	const SQL_PASSWORD = mssqlContainer.getPassword();
	const SQL_SERVER = mssqlContainer.getHost();
	const SQL_PORT = mssqlContainer.getMappedPort(1433).toString();
	const SQL_NAME = 'pantip_db';

	console.log(SQL_USER, SQL_PASSWORD, SQL_SERVER, SQL_PORT, SQL_NAME);
	process.env.SQL_USER = SQL_USER;
	process.env.SQL_PASSWORD = SQL_PASSWORD;
	process.env.SQL_SERVER = SQL_SERVER;
	process.env.SQL_PORT = SQL_PORT;
	process.env.SQL_NAME = SQL_NAME;

	process.env.DATABASE_URL = `sqlserver://${SQL_SERVER}:${SQL_PORT};database=${SQL_NAME};user=${SQL_USER};password=${SQL_PASSWORD};encrypt=true;trustServerCertificate=true`;
	process.env.JWT_SECRET = 'jesusloveme';
	process.env.JWT_EXPIRES_IN = '7d';
	process.env.PORT = '8000';
	console.log('Env set up complete');

	console.log('Resetting and migrating database...');
	// --force is required to run non-interactively in CI
	await execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
	console.log('Database migration complete.');
});

afterAll(async () => {
	// 5. Stop and remove the container
	if (mssqlContainer) {
		console.log('Stopping MSSQL container...');
		await mssqlContainer.stop();
	}
});
