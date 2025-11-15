import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

describe('Test user', () => {
	test('Check health of application', async () => {
		const response = await request(app).get('/health');

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ ok: true });
	});
});
