import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const baseURL = '/api/v1/user';
describe('Login Test', () => {
	test('Should be able to login with admin account', async () => {
		const payload = {
			email: 'admin@admin.com',
			password: 'Admin@1234',
		};
		const response = await request(app)
			.post(`${baseURL}/login`)
			.send(payload);
		expect(response.status).toBe(200);
	});

	test('Should not be able to login with wrong password', async () => {
		const payload = {
			email: 'admin@admin.com',
			password: 'wrongpassword',
		};
		const response = await request(app)
			.post(`${baseURL}/login`)
			.send(payload);
		expect(response.status).toBe(400);
	});
});

describe('Sign up Test', () => {
	const payload = {
		email: 'test@test.com',
		handle: 'Test Boy',
		display_name: 'Good Boy',
		password: 'GoodBoy@1234',
	};
	test('Sign up should work ', async () => {
		const response = await request(app)
			.post(`${baseURL}/signup`)
			.send(payload);
		expect(response.status).toBe(201);
	});

	test('Sign up should fail with existing email', async () => {
		const payload = {
			email: '',
		};
		const response = await request(app)
			.post(`${baseURL}/signup`)
			.send(payload);
		expect(response.status).toBe(400);
	});

	test('Should be able to login with new account', async () => {
		const response = await request(app).post(`${baseURL}/login`).send({
			email: payload.email,
			password: payload.password,
		});
		expect(response.status).toBe(200);
	});
});

describe('Get User Info Test', () => {
	let user_id = '';
	const loginPayload = {
		email: '',
		password: '',
	};

	test('Login to get user_id', async () => {
		loginPayload.email = 'admin@admin.com';
		loginPayload.password = 'Admin@1234';
		const response = await request(app)
			.post(`${baseURL}/login`)
			.send(loginPayload);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('user_id');
		user_id = response.body.user_id;
	});

	test('Get user info should work', async () => {
		const response = await request(app).get(`${baseURL}/stats/${user_id}`);
		expect(response.status).toBe(200);
		expect(response.body.email).toBe(loginPayload.email);
	});
});
