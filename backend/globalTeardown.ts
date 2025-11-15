// globalTeardown.ts

export default async () => {
	const container = global.__TEST_CONTAINER__;

	if (container) {
		console.log('Stopping MSSQL container...');
		await container.stop();
	}
};
