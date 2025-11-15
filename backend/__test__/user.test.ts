// src/sum.test.ts
import { sum } from './sum';

describe('Test user', () => {
	test('SHould be able to login with admin account', () => {
		console.log(process.env);
		expect(sum(1, 2)).toBe(3);
	});
});
