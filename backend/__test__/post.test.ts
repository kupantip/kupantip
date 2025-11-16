import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const baseURL = '/api/v1/post';

const userAdminPayload = {
	email: 'admin@admin.com',
	password: 'Admin@1234',
};

describe('Get Post test', () => {
	test('Should be able to get post with anonymous', async () => {
		const response = await request(app).get(`${baseURL}`);
		expect(response.status).toBe(200);
	});

	test('Should be able to get post with logged in user', async () => {
		const loginResponse = await request(app)
			.post('/api/v1/user/login')
			.send(userAdminPayload);
		expect(loginResponse.status).toBe(200);
		const token = loginResponse.body.token;

		const response = await request(app)
			.get(`${baseURL}`)
			.set('Authorization', `Bearer ${token}`);
		expect(response.status).toBe(200);
	});
});

describe('Create Post test', () => {
	test('Should not be able to create post with anonymous', async () => {
		const payload = {
			title: 'Test Post',
			body_md: 'This is a test post',
		};
		const response = await request(app).post(`${baseURL}`).send(payload);
		expect(response.status).toBe(401);
	});

	test('Should be able to create post with logged in user', async () => {
		const loginResponse = await request(app)
			.post('/api/v1/user/login')
			.send(userAdminPayload);
		expect(loginResponse.status).toBe(200);
		const token = loginResponse.body.token;

		const payload = {
			title: 'Test Post',
			body_md: 'This is a test post',
			url: 'http://example.com',
		};
		const response = await request(app)
			.post(`${baseURL}`)
			.set('Authorization', `Bearer ${token}`)
			.send(payload);
		expect(response.status).toBe(201);
	});

	test('Should be able to create post with categories', async () => {
		const loginResponse = await request(app)
			.post('/api/v1/user/login')
			.send(userAdminPayload);
		expect(loginResponse.status).toBe(200);
		const token = loginResponse.body.token;

		const responseCategories = await request(app).get(`/api/v1/categories`);
		expect(responseCategories.status).toBe(200);
		const categories = responseCategories.body;
		expect(categories.length).toBeGreaterThan(0);

		const payload = {
			title: 'Test Post with Categories',
			body_md: 'This is a test post with categories',
			url: 'http://example.com',
			category_id: categories[0].id,
		};
		const response = await request(app)
			.post(`${baseURL}`)
			.set('Authorization', `Bearer ${token}`)
			.send(payload);

		expect(response.status).toBe(201);

		// TODO: Verify category_id in the response
		expect(response.body.post).toHaveProperty(
			'category_id',
			categories[0].id
		);
	});
});
