import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const searchBaseURL = '/api/v1/search';

describe('Search Test', () => {
	const searchUserPayload = {
		email: 'Search1@test.com',
		password: 'Test@1234',
		token: '',
	};

	beforeAll(async () => {
		const searchSignupResponse = await request(app)
			.post('/api/v1/user/signup')
			.send({
				email: searchUserPayload.email,
				password: searchUserPayload.password,
				handle: 'Search user',
				display_name: 'Search User',
			});
		expect(searchSignupResponse.status).toBe(201);

		const loginResponse = await request(app)
			.post('/api/v1/user/login')
			.send({
				email: searchUserPayload.email,
				password: searchUserPayload.password,
			});
		expect(loginResponse.status).toBe(200);
		searchUserPayload.token = loginResponse.body.token;
	});

	test('Search needs to display 3 field (users, comments, posts)', async () => {
		const response = await request(app)
			.get(`${searchBaseURL}?query=4`)
			.set('Authorization', `Bearer ${searchUserPayload.token}`);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('users');
		expect(response.body).toHaveProperty('comments');
		expect(response.body).toHaveProperty('posts');
	});
});
