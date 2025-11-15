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
		'default',
		['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }],
	],
};
