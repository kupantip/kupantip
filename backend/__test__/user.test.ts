// src/sum.test.ts
import { sum } from './sum';

describe('sum', () => {
	test('adds 1 + 2 to equal 3', () => {
		console.log(process.env);
		expect(sum(1, 2)).toBe(3);
	});
});
