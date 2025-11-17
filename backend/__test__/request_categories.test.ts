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

type ReqestedCategory = {
	id: string;
	requester_id: string;
	label: string;
	color_hex: string;
	detail: string;
	status: 'open' | 'actioned' | 'dismissed';
	created_at: string;
	reviewed_at: string | null;
	reviewed_by: string | null;
	requester_name: string;
	reviewer_name: string | null;
	minutes_since_requested: number;
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
		status: null,
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

	test('New category request should exist in the database with open status', async () => {
		const response = await request(app)
			.get(`${baseURL}/${newCategory.id}`)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('status', 'open');
	});

	test('B1 should be able to create new requested category with the same label if status is open', async () => {
		const response = await request(app)
			.post(`${baseURL}`)
			.send(newCategory)
			.set('Authorization', `Bearer ${b1UserPayload.token}`);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty(
			'message',
			'Category request created'
		);
	});

	test('Admin should be able to approve a category request & Other request with the same label should be dismissed', async () => {
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

		// * Other label that not get appoved but have the same label should be dismissed
		const requestsResponse = await request(app)
			.get(`${baseURL}`)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(requestsResponse.status).toBe(200);
		const sameLabelRequests = requestsResponse.body.filter(
			(req: ReqestedCategory) =>
				req.label === newCategory.label && req.id !== newCategory.id
		);

		sameLabelRequests.forEach((req: ReqestedCategory) => {
			expect(req.status).toBe('dismissed');
		});
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

	test('Admin should be able to dismissed requested category', async () => {
		const requestResponse = await request(app)
			.post(`${baseURL}`)
			.send({
				label: 'Dismissed Category',
				color_hex: '#123456',
				detail: 'This category will be dismissed',
			})
			.set('Authorization', `Bearer ${b1UserPayload.token}`);
		expect(requestResponse.status).toBe(201);
		const requestId = requestResponse.body.data.id;

		const dismissResponse = await request(app)
			.patch(`${baseURL}/${requestId}`)
			.send({
				status: 'dismissed',
			})
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(dismissResponse.status).toBe(200);
		expect(dismissResponse.body).toHaveProperty(
			'message',
			'Category request dismissed'
		);
	});

	test('Requested category detail should return 400 for non-uuid id', async () => {
		const nonexistingid = '5555555loolllllleieieieie';
		const response = await request(app)
			.get(`${baseURL}/${nonexistingid}`)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('message', 'Validation failed');
	});

	test('Non-admin user should not be able to action category request', async () => {
		const response = await request(app)
			.patch(`${baseURL}/${newCategory.id}`)
			.send({
				status: 'dismissed',
			})
			.set('Authorization', `Bearer ${b1UserPayload.token}`);
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty(
			'message',
			'Forbidden: Only admin can review category requests'
		);
	});
});
