import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const baseURL = '/api/v1/announcement';

const adminPayload = {
	email: 'admin@admin.com',
	password: 'Admin@1234',
	token: '',
};

const AnnouncementUserPayload = {
	email: 'Announcemen2@user.com',
	password: 'B2user@1234',
	token: '',
};

export type Announcement = {
	id: string;
	author_id: string;
	title: string;
	body_md: string;
	create_at: string;
	start_at: string;
	end_at: string;
	delete_at: string | null;
};

export type AnnouncementResponse = {
	message: string;
	announcement: Announcement;
};

describe('Request Annoucement Test', () => {
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
				email: AnnouncementUserPayload.email,
				password: AnnouncementUserPayload.password,
				handle: 'b2user',
				display_name: 'B2 User',
			});
		expect(b1signupResponse.status).toBe(201);

		const b1LoginResponse = await request(app)
			.post('/api/v1/user/login')
			.send({
				email: AnnouncementUserPayload.email,
				password: AnnouncementUserPayload.password,
			});
		expect(b1LoginResponse.status).toBe(200);
		AnnouncementUserPayload.token = b1LoginResponse.body.token;
	});

	//** CREATE POST */

	const newAnnoucement = {
		title: 'Course registration period',
		body_md:
			'Course registration for semester 2/2025 will open on November 20. Please register early to avoid system congestion.',
		start_at: '2025-11-08T09:00:00.000Z',
		end_at: '2027-11-22T00:00:00.000Z',
		id: '',
		status: null,
	};

	test('Unauthorized user should not be able to create a new annoucement post', async () => {
		const response = await request(app)
			.post(`${baseURL}`)
			.send(newAnnoucement);
		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty('message', 'No token provided');
	});

	test('B1 user should not be able to create a new annoucement post', async () => {
		const response = await request(app)
			.post(`${baseURL}`)
			.send(newAnnoucement)
			.set('Authorization', `Bearer ${AnnouncementUserPayload.token}`);
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty(
			'message',
			'Forbidden: Only admin, staff, and teacher can create announcements'
		);
	});

	test('Admin should be able to create a new annoucement post', async () => {
		const response = await request(app)
			.post(`${baseURL}`)
			.send(newAnnoucement)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		const resBody: AnnouncementResponse = response.body;
		expect(response.status).toBe(201);
		expect(resBody).toHaveProperty(
			'message',
			'Announcement created successfully'
		);

		newAnnoucement['id'] = resBody.announcement.id;
	});

	//** GET POST */

	test('Unauthorized user should be able to get post', async () => {
		const response = await request(app).get(`${baseURL}`);
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body.announcements)).toBe(true);
	});

	test('B1 should be able to get post', async () => {
		const response = await request(app)
			.get(`${baseURL}`)
			.set('Authorization', `Bearer ${AnnouncementUserPayload.token}`);
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body.announcements)).toBe(true);
	});

	test('Admin should be able to get post', async () => {
		const response = await request(app)
			.get(`${baseURL}`)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body.announcements)).toBe(true);
	});

	//** DELETE */

	test('Unauthorized user should not be able to delete announcement', async () => {
		const response = await request(app).delete(
			`${baseURL}/${newAnnoucement.id}`
		);
		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty('message', 'No token provided');
	});

	test('B1 should not be able to delete announcement', async () => {
		const response = await request(app)
			.delete(`${baseURL}/${newAnnoucement.id}`)
			.set('Authorization', `Bearer ${AnnouncementUserPayload.token}`);
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty(
			'message',
			'Forbidden: Only admin, staff, and teacher can delete announcements'
		);
	});

	test('Admin should be able to delete announcement', async () => {
		const response = await request(app)
			.delete(`${baseURL}/${newAnnoucement.id}`)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty(
			'message',
			'Announcement deleted successfully'
		);
	});
});
