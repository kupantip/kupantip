const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
	testEnvironment: 'node',
	transform: {
		...tsJestTransformCfg,
	},
	globalSetup: './globalSetup.ts',
	globalTeardown: './globalTeardown.ts',
	reporters: [
		'default', // Keep the default console reporter
		['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }],
	],
};
