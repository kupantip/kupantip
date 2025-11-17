import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const baseURL = '/api/v1/requested-categories';

const adminPayload = {
	email: 'admin@admin.com',
	password: 'Admin@1234',
	token: '',
};

const b1UserPayload = {
	email: 'b1@user.com',
	password: 'B1user@1234',
	token: '',
};

describe('Reqest Categories Test', () => {
	beforeAll(async () => {
		const loginResponse = await request(app)
			.post('/api/v1/user/login')
			.send({
				email: adminPayload.email,
				password: adminPayload.password,
			});
		expect(loginResponse.status).toBe(200);
		adminPayload.token = loginResponse.body.token;

		const b1signupResponse = await request(app)
			.post('/api/v1/user/signup')
			.send({
				email: b1UserPayload.email,
				password: b1UserPayload.password,
				handle: 'b1user',
				display_name: 'B1 User',
			});
		expect(b1signupResponse.status).toBe(201);

		const b1LoginResponse = await request(app)
			.post('/api/v1/user/login')
			.send({
				email: b1UserPayload.email,
				password: b1UserPayload.password,
			});
		expect(b1LoginResponse.status).toBe(200);
		b1UserPayload.token = b1LoginResponse.body.token;
	});

	test('No user should not be able to get category requests', async () => {
		const response = await request(app).get(`${baseURL}`);
		expect(response.status).toBe(401);
	});

	test('No user should not be able to request a new category', async () => {
		const payload = {
			label: 'New Category Request',
			reason: 'Need this category for testing',
		};
		const response = await request(app).post(`${baseURL}`).send(payload);
		expect(response.status).toBe(401);
	});

	const newCategory = {
		label: 'Study',
		color_hex: '#E2A16F',
		detail: 'discuss about study',
		id: null,
	};

	test('B1 user should be able to request a new category', async () => {
		const response = await request(app)
			.post(`${baseURL}`)
			.send(newCategory)
			.set('Authorization', `Bearer ${b1UserPayload.token}`);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty(
			'message',
			'Category request created'
		);

		newCategory['id'] = response.body.data.id;
	});

	test('B1 user should not be able to request an existing category', async () => {
		const response = await request(app)
			.post(`${baseURL}`)
			.send(newCategory)
			.set('Authorization', `Bearer ${b1UserPayload.token}`);
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty(
			'message',
			`Category "${newCategory.label}" already exists`
		);
	});

	test('Admin should be able to get category requests', async () => {
		const response = await request(app)
			.get(`${baseURL}`)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
	});

	test('Admin should be able to approve a category request', async () => {
		const approveResponse = await request(app)
			.patch(`${baseURL}/${newCategory.id}`)
			.send({
				status: 'actioned',
			})
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(approveResponse.status).toBe(200);
		expect(approveResponse.body).toHaveProperty(
			'message',
			'Category request actioned'
		);
	});
});
