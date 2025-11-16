import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const baseURL = '/api/v1/categories';

describe('Categories Test', () => {
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
		const response = await request(app).post(`${baseURL}`).send(payload);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('category');
		expect(response.body.category).toHaveProperty('label', payload.label);
	});

	test('Create Existing Category should fail', async () => {
		const payload = {
			label: 'Test Category',
			color_hex: '#FF5733',
			detail: 'This is a test category',
		};
		const response = await request(app).post(`${baseURL}`).send(payload);
		expect(response.status).toBe(400);
	});

	test('Create with out required fields should fail', async () => {
		const payload = {
			color_hex: '#FF5733',
		};
		const response = await request(app).post(`${baseURL}`).send(payload);
		expect(response.status).toBe(400);
	});

	test('Create without detail should work', async () => {
		const payload = {
			label: 'Another Test Category',
			color_hex: '#33FF57',
		};
		const response = await request(app).post(`${baseURL}`).send(payload);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('category');
		expect(response.body.category).toHaveProperty('label', payload.label);
	});
});
