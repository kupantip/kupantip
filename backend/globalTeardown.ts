// globalTeardown.ts
import { StartedMSSQLServerContainer } from '@testcontainers/mssqlserver';

export default async () => {
	const container: StartedMSSQLServerContainer = (global as any)
		.testContainer;

	if (container) {
		console.log('Stopping MSSQL container...');
		await container.stop();
	}
};
