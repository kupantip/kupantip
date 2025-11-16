import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const baseURL = '/api/v1/categories';

const adminPayload = {
	email: 'admin@admin.com',
	password: 'Admin@1234',
	token: '',
};

describe('Categories Test', () => {
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

	test('Get Categories', async () => {
		const response = await request(app).get(`${baseURL}`);
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
	});

	test('Create Category', async () => {
		const payload = {
			label: 'Test Category',
			color_hex: '#FF5733',
			detail: 'This is a test category',
		};
		const response = await request(app)
			.post(`${baseURL}`)
			.send(payload)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('category');
		expect(response.body.category).toHaveProperty('label', payload.label);
	});

	test('Should not allow non-admin to create category', async () => {
		const payload = {
			label: 'Unauthorized Category',
			color_hex: '#123456',
			detail: 'This should not be created',
		};
		const response = await request(app).post(`${baseURL}`).send(payload);
		expect(response.status).toBe(401);
	});

	test('Create Existing Category should fail', async () => {
		const payload = {
			label: 'Test Category',
			color_hex: '#FF5733',
			detail: 'This is a test category',
		};
		const response = await request(app)
			.post(`${baseURL}`)
			.send(payload)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(response.status).toBe(400);
	});

	test('Create with out required fields should fail', async () => {
		const payload = {
			color_hex: '#FF5733',
		};
		const response = await request(app)
			.post(`${baseURL}`)
			.send(payload)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(response.status).toBe(400);
	});

	test('Create without detail should work', async () => {
		const payload = {
			label: 'Another Test Category',
			color_hex: '#33FF57',
		};
		const response = await request(app)
			.post(`${baseURL}`)
			.send(payload)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('category');
		expect(response.body.category).toHaveProperty('label', payload.label);
	});
});
