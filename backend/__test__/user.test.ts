import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const baseURL = '/api/v1/user';
describe('test login', () => {
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
		console.log(response);
		expect(response.status).toBe(400);
	});
});

// describe('test sign up', () => {
// 	test('')
// })
