import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const moderationBaseURL = '/api/v1/moderation-actions';

const adminPayload = {
	email: 'admin@admin.com',
	password: 'Admin@1234',
	token: '',
};

describe('Get Moderation Action', () => {
	beforeAll(async () => {
		const loginResponse = await request(app)
			.post('/api/v1/user/login')
			.send({
				email: adminPayload.email,
				password: adminPayload.password,
			});
		expect(loginResponse.status).toBe(200);
		adminPayload.token = loginResponse.body.token;
	});

	test('Get All Moderation Action', async () => {
		const res = await request(app)
			.get(moderationBaseURL)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		if (res.body.length > 0) {
			for (const item of res.body) {
				expect(item).toHaveProperty('id');
				expect(item).toHaveProperty('actor_id');
				expect(item).toHaveProperty('target_type');
				expect(item).toHaveProperty('target_id');
				expect(item).toHaveProperty('action_type');
				expect(item).toHaveProperty('details');
				expect(item).toHaveProperty('created_at');
				expect(item).toHaveProperty('actor_handle');
				expect(item).toHaveProperty('actor_name');
				expect(item).toHaveProperty('actor_email');
			}
		}
	});
});
