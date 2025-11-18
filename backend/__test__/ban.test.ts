import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const categoryBaseURL = '/api/v1/categories';
const postBaseURL = '/api/v1/post';
const reportBaseURL = '/api/v1/report';
const banBaseURL = '/api/v1/ban';

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

const b2UserPayload = {
	email: 'b2@user.com',
	password: 'B2user@1234',
	token: '',
};

export type Report = {
	id: string;
	target_type: string;
	target_id: string;
	reporter_id: string;
	reason: string;
	created_at: string;
	status: string;
};

export type ReportResponse = {
	message: string;
	report: Report;
};

describe('Normal Post Ban', () => {
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

		const b2signupResponse = await request(app)
			.post('/api/v1/user/signup')
			.send({
				email: b2UserPayload.email,
				password: b2UserPayload.password,
				handle: 'b2user',
				display_name: 'B2 User',
			});
		expect(b2signupResponse.status).toBe(201);

		const b2LoginResponse = await request(app)
			.post('/api/v1/user/login')
			.send({
				email: b2UserPayload.email,
				password: b2UserPayload.password,
			});
		expect(b2LoginResponse.status).toBe(200);
		b2UserPayload.token = b2LoginResponse.body.token;
	});
	test('Admin create new category', async () => {
		const payload = {
			label: 'Admin created Category',
			color_hex: '#123456',
			detail: 'test',
		};
		const response = await request(app)
			.post(`${categoryBaseURL}`)
			.send(payload)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('category');
		expect(response.body.category).toHaveProperty('label', payload.label);
	});

	let createdPostId = '';

	test('B1 create a new post', async () => {
		const payload = {
			title: 'Any one here? file2',
			body_md: 'asdfasd',
			url: 'http://example.com',
		};
		const response = await request(app)
			.post(`${postBaseURL}`)
			.set('Authorization', `Bearer ${b1UserPayload.token}`)
			.send(payload);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('message', 'Post created');
		expect(response.body).toHaveProperty('post');
		expect(response.body.post).toHaveProperty('id');
		expect(response.body.post).toMatchObject({
			title: payload.title,
			body_md: payload.body_md,
			url: payload.url,
			deleted_at: null,
		});
		// Optionally check attachments array exists
		expect(Array.isArray(response.body.attachments)).toBe(true);
		createdPostId = response.body.post.id;
	});

	test('B2 reports the post', async () => {
		const reportPayload = {
			target_type: 'post',
			target_id: createdPostId,
			reason: 'test report2',
		};
		const response = await request(app)
			.post(reportBaseURL)
			.set('Authorization', `Bearer ${b2UserPayload.token}`)
			.send(reportPayload);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('message', 'Report created');
		expect(response.body).toHaveProperty('report');
		expect(response.body.report).toMatchObject({
			target_type: 'post',
			target_id: createdPostId,
			reason: 'test report2',
			status: 'open',
		});
		expect(response.body.report).toHaveProperty('id');
		expect(response.body.report).toHaveProperty('reporter_id');
		expect(response.body.report).toHaveProperty('created_at');
	});

	let createdReportId = '';

	test('Admin update report status to actioned (Ban)', async () => {
		// First, get the report id (assume only one report for this post)
		const getReportsRes = await request(app)
			.get(reportBaseURL)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(getReportsRes.status).toBe(200);
		// Debug print all reports
		// console.log('All reports:', getReportsRes.body);
		const report = getReportsRes.body.find(
			(r: any) => r.target_id === createdPostId
		);
		// console.log('Selected report:', report);
		expect(report).toBeDefined();
		createdReportId = report.id;

		// Now, update the report status
		const updatePayload = { status: 'actioned' };
		// console.log('PATCH endpoint:', `${reportBaseURL}/${report.id}`);
		const updateRes = await request(app)
			.patch(`${reportBaseURL}/${report.id}`)
			.set('Authorization', `Bearer ${adminPayload.token}`)
			.send(updatePayload);
		// console.log('Update response:', updateRes.status, updateRes.body);
		expect(updateRes.status).toBe(200);
		expect(updateRes.body).toHaveProperty('message', 'Report updated');
		expect(updateRes.body).toHaveProperty('report');
		expect(updateRes.body.report).toMatchObject({
			id: createdReportId,
			target_type: 'post',
			target_id: createdPostId,
			status: 'actioned',
		});
		expect(updateRes.body.report).toHaveProperty('reporter_id');
		expect(updateRes.body.report).toHaveProperty('reason');
		expect(updateRes.body.report).toHaveProperty('created_at');
	});

	test('Carry out ban user B1', async () => {
		// Use the actual user_id, report_id, and post_id from previous steps
		// The user to ban is report.reported_user_id (not target_id)
		const getReportsRes = await request(app)
			.get(reportBaseURL)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(getReportsRes.status).toBe(200);
		const report = getReportsRes.body.find(
			(r: any) => r.id === createdReportId
		);
		expect(report).toBeDefined();
		const banPayload = {
			user_id: report.reported_user_id || '',
			ban_type: 'post_ban',
			reason_admin: 'This gay spam content',
			reason_user: 'You posted spam content',
			end_at: new Date(
				Date.now() + 7 * 24 * 60 * 60 * 1000
			).toISOString(), // 7 days from now
			related_report_id: createdReportId,
		};

		// If user_id is not available in b1UserPayload, you may need to fetch it from the report or user API
		// For now, we assume it's available or you can adjust as needed

		const response = await request(app)
			.post(banBaseURL)
			.set('Authorization', `Bearer ${adminPayload.token}`)
			.send(banPayload);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty(
			'message',
			'Ban created successfully, reported post deleted, and report marked as actioned'
		);
		expect(response.body).toHaveProperty('ban');
		expect(response.body.ban).toMatchObject({
			user_id: banPayload.user_id,
			ban_type: 'post_ban',
			reason_admin: banPayload.reason_admin,
			reason_user: banPayload.reason_user,
			related_report_id: banPayload.related_report_id,
		});
		expect(response.body).toHaveProperty('content_deleted');
		expect(response.body.content_deleted).toHaveProperty('type', 'post');
		expect(response.body.content_deleted).toHaveProperty('id');
		expect(response.body).toHaveProperty('report_updated', true);
	});

	test('B1 should not be able to post anymore', async () => {
		const payload = {
			title: 'Should not work',
			body_md: 'Banned user should not post',
			url: 'http://example.com',
		};
		const response = await request(app)
			.post(`${postBaseURL}`)
			.set('Authorization', `Bearer ${b1UserPayload.token}`)
			.send(payload);
		// Acceptable: 403 Forbidden, 401 Unauthorized, or custom error
		expect([401, 403]).toContain(response.status);
		expect(response.body).toHaveProperty('message');
	});
});
