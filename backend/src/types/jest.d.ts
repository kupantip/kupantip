// jest.d.ts

declare global {
	// This uses an inline import() to get the type without a top-level import
	var __TEST_CONTAINER__:
		| import('@testcontainers/mssqlserver').StartedMSSQLServerContainer
		| undefined;
}

// This empty export is still important.
export {};
