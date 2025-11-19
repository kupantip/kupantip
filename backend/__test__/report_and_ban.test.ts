import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const categoryBaseURL = '/api/v1/categories';
const postBaseURL = '/api/v1/post';
const reportBaseURL = '/api/v1/report';
const banBaseURL = '/api/v1/ban';
const commentBaseURL = '/api/v1/comment';

const adminPayload = {
	email: 'admin@admin.com',
	password: 'Admin@1234',
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

export type Post = {
	id: string;
	title: string;
	body_md: string;
	url: string;
	created_at: string;
	updated_at: string;
	author_name: string;
	author_id: string;
	category_label: string;
	category_id: string;
	attachments: any[];
};

describe('Normal Post Ban', () => {
	const ReportBan1UserPayload = {
		email: 'ReportBan1@user.com',
		password: 'B1user@1234',
		token: '',
	};

	const ReportBan2UserPayload = {
		email: 'ReportBan2@user.com',
		password: 'B2user@1234',
		token: '',
	};
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
				email: ReportBan1UserPayload.email,
				password: ReportBan1UserPayload.password,
				handle: 'ReportBan b1user',
				display_name: 'ReportBan B1 User',
			});
		expect(b1signupResponse.status).toBe(201);

		const b1LoginResponse = await request(app)
			.post('/api/v1/user/login')
			.send({
				email: ReportBan1UserPayload.email,
				password: ReportBan1UserPayload.password,
			});
		expect(b1LoginResponse.status).toBe(200);
		ReportBan1UserPayload.token = b1LoginResponse.body.token;

		const b2signupResponse = await request(app)
			.post('/api/v1/user/signup')
			.send({
				email: ReportBan2UserPayload.email,
				password: ReportBan2UserPayload.password,
				handle: 'ReportBan b2user',
				display_name: 'ReportBan B2 User',
			});
		expect(b2signupResponse.status).toBe(201);

		const b2LoginResponse = await request(app)
			.post('/api/v1/user/login')
			.send({
				email: ReportBan2UserPayload.email,
				password: ReportBan2UserPayload.password,
			});
		expect(b2LoginResponse.status).toBe(200);
		ReportBan2UserPayload.token = b2LoginResponse.body.token;
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
			.set('Authorization', `Bearer ${ReportBan1UserPayload.token}`)
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
			.set('Authorization', `Bearer ${ReportBan2UserPayload.token}`)
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
			(r: Report) => r.target_id === createdPostId
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
			(r: Report) => r.id === createdReportId
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

		// If user_id is not available in ReportBan1UserPayload, you may need to fetch it from the report or user API
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

	test('B1 post should not be available to other user now', async () => {
		// Try to get the banned/deleted post as b2
		const response = await request(app)
			.get(`${postBaseURL}/${createdPostId}`)
			.set('Authorization', `Bearer ${ReportBan2UserPayload.token}`);
		// Acceptable: 404 Not Found, 410 Gone, or custom error
		expect([404, 410]).toContain(response.status);
		expect(response.body).toHaveProperty('message');
	});

	test('B1 should not be able to post anymore', async () => {
		const payload = {
			title: 'Should not work',
			body_md: 'Banned user should not post',
			url: 'http://example.com',
		};
		const response = await request(app)
			.post(`${postBaseURL}`)
			.set('Authorization', `Bearer ${ReportBan1UserPayload.token}`)
			.send(payload);
		// Acceptable: 403 Forbidden, 401 Unauthorized, or custom error
		expect([401, 403]).toContain(response.status);
		expect(response.body).toHaveProperty('message');
	});
});

describe('Test Comment Ban', () => {
	const dUserPayload = {
		email: 'd@user.com',
		password: 'Duser@1234',
		token: '',
	};
	const cUserPayload = {
		email: 'c@user.com',
		password: 'Cuser@1234',
		token: '',
	};
	let commentCategoryId = '';
	let commentPostId = '';
	let createdCommentId = '';
	let createdCommentReportId = '';

	beforeAll(async () => {
		// Signup and login B3
		const b3SignupRes = await request(app)
			.post('/api/v1/user/signup')
			.send({
				email: dUserPayload.email,
				password: dUserPayload.password,
				handle: 'duser',
				display_name: 'D User',
			});
		expect([200, 201]).toContain(b3SignupRes.status);
		const b3LoginRes = await request(app).post('/api/v1/user/login').send({
			email: dUserPayload.email,
			password: dUserPayload.password,
		});
		expect(b3LoginRes.status).toBe(200);
		dUserPayload.token = b3LoginRes.body.token;

		// Signup and login C
		const cSignupRes = await request(app).post('/api/v1/user/signup').send({
			email: cUserPayload.email,
			password: cUserPayload.password,
			handle: 'cuser',
			display_name: 'C User',
		});
		expect([200, 201]).toContain(cSignupRes.status);
		const cLoginRes = await request(app).post('/api/v1/user/login').send({
			email: cUserPayload.email,
			password: cUserPayload.password,
		});
		expect(cLoginRes.status).toBe(200);
		cUserPayload.token = cLoginRes.body.token;

		// Admin creates a category for comment ban test
		const categoryPayload = {
			label: 'Comment Ban Category',
			color_hex: '#654321',
			detail: 'category for comment ban',
		};
		const categoryRes = await request(app)
			.post(categoryBaseURL)
			.send(categoryPayload)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(categoryRes.status).toBe(201);
		expect(categoryRes.body).toHaveProperty('category');
		commentCategoryId = categoryRes.body.category.id;
	});

	test('C comments on D post', async () => {
		// B3 creates a post for comment ban test
		const postPayload = {
			title: 'Comment Ban Test Post',
			body_md: 'Testing comment ban',
			url: 'http://example.com',
			category_id: commentCategoryId,
		};
		const postRes = await request(app)
			.post(postBaseURL)
			.set('Authorization', `Bearer ${dUserPayload.token}`)
			.send(postPayload);
		expect(postRes.status).toBe(201);
		expect(postRes.body).toHaveProperty('post');
		// Only assign, do not redeclare
		commentPostId = postRes.body.post.id;
		const payload = {
			parent_id: '',
			body_md: 'This is a comment from C',
		};
		const response = await request(app)
			.post(`${commentBaseURL}?post_id=${commentPostId}`)
			.set('Authorization', `Bearer ${cUserPayload.token}`)
			.send(payload);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Comment success');
		createdCommentId = response.body.comment.id;

		// console.log('test here ------------');
		// console.log('createdCommentId: ', createdCommentId);
	});

	test('D reports C comment', async () => {
		const reportPayload = {
			target_type: 'comment',
			target_id: createdCommentId,
			reason: 'Inappropriate comment',
		};
		// console.log('D Report payload ', reportPayload);
		const response = await request(app)
			.post(reportBaseURL)
			.set('Authorization', `Bearer ${dUserPayload.token}`)
			.send(reportPayload);
		// if (response.status !== 201) {
		// 	console.log(
		// 		'D report comment response:',
		// 		response.status,
		// 		response.body
		// 	);
		// }
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('report');
		createdCommentReportId = response.body.report.id;
	});

	test('Admin bans C (comment ban)', async () => {
		// Get the report to find reported_user_id
		const getReportsRes = await request(app)
			.get(reportBaseURL)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(getReportsRes.status).toBe(200);
		const report = getReportsRes.body.find(
			(r: Report) => r.id === createdCommentReportId
		);
		expect(report).toBeDefined();
		const banPayload = {
			user_id: report.reported_user_id || '',
			ban_type: 'comment_ban',
			reason_admin: 'Spam comment',
			reason_user: 'You posted spam comment',
			end_at: new Date(
				Date.now() + 7 * 24 * 60 * 60 * 1000
			).toISOString(),
			related_report_id: createdCommentReportId,
		};
		const response = await request(app)
			.post(banBaseURL)
			.set('Authorization', `Bearer ${adminPayload.token}`)
			.send(banPayload);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('message');
		expect(response.body).toHaveProperty('ban');
		expect(response.body.ban).toMatchObject({
			user_id: banPayload.user_id,
			ban_type: 'comment_ban',
			reason_admin: banPayload.reason_admin,
			reason_user: banPayload.reason_user,
			related_report_id: banPayload.related_report_id,
		});
		expect(response.body).toHaveProperty('content_deleted');
		expect(response.body.content_deleted).toHaveProperty('type', 'comment');
		expect(response.body.content_deleted).toHaveProperty(
			'id',
			createdCommentId
		);
		expect(response.body).toHaveProperty('report_updated', true);
	});

	test('C cannot comment anymore', async () => {
		const payload = {
			post_id: commentPostId,
			body_md: 'Should not work',
		};
		const response = await request(app)
			.post(commentBaseURL)
			.set('Authorization', `Bearer ${cUserPayload.token}`)
			.send(payload);
		expect([401, 403]).toContain(response.status);
		expect(response.body).toHaveProperty('message');
	});
});

describe('Test Suspend Ban', () => {
	// Banned
	const eUserPayload = {
		email: 'e@user.com',
		password: 'Euser@1234',
		token: '',
	};

	// Reporter
	const fUserPayload = {
		email: 'f@user.com',
		password: 'Fuser@1234',
		token: '',
	};

	let CategoryId = '';
	let PostId = '';
	let ReportId = '';

	beforeAll(async () => {
		// Sign up and login E
		const eSignupRes = await request(app).post('/api/v1/user/signup').send({
			email: eUserPayload.email,
			password: eUserPayload.password,
			handle: 'euser',
			display_name: 'E User',
		});
		expect([200, 201]).toContain(eSignupRes.status);
		const eLoginRes = await request(app).post('/api/v1/user/login').send({
			email: eUserPayload.email,
			password: eUserPayload.password,
		});
		expect(eLoginRes.status).toBe(200);
		eUserPayload.token = eLoginRes.body.token;

		// Sign up and login F
		const fSignupRes = await request(app).post('/api/v1/user/signup').send({
			email: fUserPayload.email,
			password: fUserPayload.password,
			handle: 'fuser',
			display_name: 'F User',
		});
		expect([200, 201]).toContain(fSignupRes.status);
		const fLoginRes = await request(app).post('/api/v1/user/login').send({
			email: fUserPayload.email,
			password: fUserPayload.password,
		});
		expect(fLoginRes.status).toBe(200);
		fUserPayload.token = fLoginRes.body.token;

		// Admin creates a category for comment ban test
		const categoryPayload = {
			label: 'Suspend Ban Category', // Make this unique
			color_hex: '#654321',
			detail: 'category for suspend ban',
		};
		const categoryRes = await request(app)
			.post(categoryBaseURL)
			.send(categoryPayload)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(categoryRes.status).toBe(201);
		expect(categoryRes.body).toHaveProperty('category');
		CategoryId = categoryRes.body.category.id;
	});

	test('F report on E', async () => {
		// creates a post for comment ban test
		const postPayload = {
			title: 'Ban Test Post',
			body_md: 'Testing ban',
			url: 'http://example.com',
			category_id: CategoryId,
		};
		const postRes = await request(app)
			.post(postBaseURL)
			.set('Authorization', `Bearer ${eUserPayload.token}`)
			.send(postPayload);
		expect(postRes.status).toBe(201);
		expect(postRes.body).toHaveProperty('post');
		PostId = postRes.body.post.id;
		const reportPayload = {
			target_type: 'post',
			target_id: PostId,
			reason: 'Inappropriate post',
		};
		// console.log('Report Payload', reportPayload);
		const response = await request(app)
			.post(reportBaseURL)
			.set('Authorization', `Bearer ${fUserPayload.token}`)
			.send(reportPayload);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('report');
		ReportId = response.body.report.id;

		// Now, update the report status
		const updatePayload = { status: 'actioned' };
		// console.log('PATCH endpoint:', `${reportBaseURL}/${report.id}`);
		const updateRes = await request(app)
			.patch(`${reportBaseURL}/${ReportId}`)
			.set('Authorization', `Bearer ${adminPayload.token}`)
			.send(updatePayload);
		// console.log('Update response:', updateRes.status, updateRes.body);
		expect(updateRes.status).toBe(200);
		expect(updateRes.body).toHaveProperty('message', 'Report updated');
		expect(updateRes.body).toHaveProperty('report');
		expect(updateRes.body.report).toMatchObject({
			id: ReportId,
			target_type: 'post',
			target_id: PostId,
			status: 'actioned',
		});
		expect(updateRes.body.report).toHaveProperty('reporter_id');
		expect(updateRes.body.report).toHaveProperty('reason');
		expect(updateRes.body.report).toHaveProperty('created_at');
	});

	test('Admin suspend ban E', async () => {
		const getReportsRes = await request(app)
			.get(reportBaseURL)
			.set('Authorization', `Bearer ${adminPayload.token}`);
		expect(getReportsRes.status).toBe(200);
		const report = getReportsRes.body.find(
			(r: Report) => r.id === ReportId
		);
		expect(report).toBeDefined();
		const banPayload = {
			user_id: report.reported_user_id || '',
			ban_type: 'suspend',
			reason_admin: 'Spam comment',
			reason_user: 'You posted spam comment',
			end_at: new Date(
				Date.now() + 7 * 24 * 60 * 60 * 1000
			).toISOString(),
			related_report_id: ReportId,
		};
		const response = await request(app)
			.post(banBaseURL)
			.set('Authorization', `Bearer ${adminPayload.token}`)
			.send(banPayload);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('message');
		expect(response.body).toHaveProperty('ban');
		expect(response.body.ban).toMatchObject({
			user_id: banPayload.user_id,
			ban_type: 'suspend',
			reason_admin: banPayload.reason_admin,
			reason_user: banPayload.reason_user,
			related_report_id: banPayload.related_report_id,
		});
		expect(response.body).toHaveProperty('content_deleted');
		expect(response.body.content_deleted).toHaveProperty('type', 'post');
		expect(response.body.content_deleted).toHaveProperty('id', PostId);
		expect(response.body).toHaveProperty('report_updated', true);
	});

	test('E should not be able to post, login, comment or vote', async () => {
		// Try to create a post
		const postPayload = {
			title: 'Should not work',
			body_md: 'Suspended user should not post',
			url: 'http://example.com',
			category_id: CategoryId,
		};
		const postRes = await request(app)
			.post(postBaseURL)
			.set('Authorization', `Bearer ${eUserPayload.token}`)
			.send(postPayload);
		expect([401, 403]).toContain(postRes.status);
		expect(postRes.body).toHaveProperty('message');

		// Try to comment
		const commentPayload = {
			post_id: PostId,
			body_md: 'Suspended user should not comment',
		};
		const commentRes = await request(app)
			.post(commentBaseURL)
			.set('Authorization', `Bearer ${eUserPayload.token}`)
			.send(commentPayload);
		expect([401, 403]).toContain(commentRes.status);
		expect(commentRes.body).toHaveProperty('message');

		// Try to vote on a comment (use the provided comment id)
		const commentVoteId = 'F67B433E-F36B-1410-8FF8-000C4550AF76';
		const votePayload = { value: 1 };
		const voteRes = await request(app)
			.post(`/api/v1/comment-vote/${commentVoteId}`)
			.set('Authorization', `Bearer ${eUserPayload.token}`)
			.send(votePayload);
		expect([401, 403]).toContain(voteRes.status);
		expect(voteRes.body).toHaveProperty('message');
	});
});

describe('Test Shadow Ban', () => {
	const UserAPayload = {
		email: 'ShadowBana@user.com',
		password: 'ShadowBanAuser@1234',
		token: '',
	};
	const UserBPayload = {
		email: 'b@user.com',
		password: 'Buser@1234',
		token: '',
	};

	let CategoryId = '';
	let BannedPostId = '';
	let BannedUserId = '';
	let RelatedReportId = '';

	beforeAll(async () => {
		const aSignupRes = await request(app).post('/api/v1/user/signup').send({
			email: UserAPayload.email,
			password: UserAPayload.password,
			handle: 'shadowban a user',
			display_name: 'shadowban A User',
		});
		expect([200, 201]).toContain(aSignupRes.status);
		const aLoginRes = await request(app).post('/api/v1/user/login').send({
			email: UserAPayload.email,
			password: UserAPayload.password,
		});
		expect(aLoginRes.status).toBe(200);
		UserAPayload.token = aLoginRes.body.token;

		const bSignupRes = await request(app).post('/api/v1/user/signup').send({
			email: UserBPayload.email,
			password: UserBPayload.password,
			handle: 'buser',
			display_name: 'B User',
		});
		expect([200, 201]).toContain(bSignupRes.status);
		const bLoginRes = await request(app).post('/api/v1/user/login').send({
			email: UserBPayload.email,
			password: UserBPayload.password,
		});
		expect(bLoginRes.status).toBe(200);
		UserBPayload.token = bLoginRes.body.token;
	});

	test('Create new a category', async () => {
		const categoryPayload = {
			label: 'Shadow Ban Category', // Make this unique
			color_hex: '#654321',
			detail: 'category for suspend ban',
		};
		const categoryRes = await request(app)
			.post(categoryBaseURL)
			.set('Authorization', `Bearer ${adminPayload.token}`)
			.send(categoryPayload);
		expect(categoryRes.status).toBe(201);
		expect(categoryRes.body).toHaveProperty('category');
		CategoryId = categoryRes.body.category.id;
	});

	test('A create a new Post', async () => {
		const postPayload = {
			title: 'Shadow Ban Test Post',
			body_md: 'Testing shadow ban',
			url: 'http://example.com',
			category_id: CategoryId,
		};
		const postRes = await request(app)
			.post(postBaseURL)
			.set('Authorization', `Bearer ${UserAPayload.token}`)
			.send(postPayload);
		expect(postRes.status).toBe(201);
		expect(postRes.body).toHaveProperty('post');
		BannedPostId = postRes.body.post.id;
		BannedUserId = postRes.body.post.author_id;
	});

	test('Admin ban Post A', async () => {
		const reportPayload = {
			target_type: 'post',
			target_id: BannedPostId,
			reason: 'shadow ban because ...',
		};

		console.log('reportPayload', reportPayload);

		const reportRes = await request(app)
			.post(reportBaseURL)
			.set('Authorization', `Bearer ${UserAPayload.token}`)
			.send(reportPayload);
		expect(reportRes.status).toBe(201);
		expect(reportRes.body).toHaveProperty('message');
		expect(reportRes.body).toHaveProperty('report');

		RelatedReportId = reportRes.body.report.id;

		const banPayload = {
			user_id: BannedUserId,
			ban_type: 'shadowban',
			reason_admin: 'shadow ban',
			reason_user: 'shadow ban',
			end_at: new Date(
				Date.now() + 7 * 24 * 60 * 60 * 1000
			).toISOString(),
			related_report_id: RelatedReportId,
		};
		const response = await request(app)
			.post(banBaseURL)
			.set('Authorization', `Bearer ${adminPayload.token}`)
			.send(banPayload);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('message');
		expect(response.body).toHaveProperty('ban');
		expect(response.body).toHaveProperty('content_deleted');
		expect(response.body).toHaveProperty('report_updated');
		expect(response.body.ban).toMatchObject({
			user_id: banPayload.user_id,
			ban_type: 'shadowban',
			reason_admin: banPayload.reason_admin,
			reason_user: banPayload.reason_user,
		});
	});

	test('User A should now be shadow ban', async () => {
		console.log('BannedUserId', BannedUserId);
		const userBannedRes = await request(app)
			.get(`${banBaseURL}/user/status/${BannedUserId}`)
			.set('Authorization', `Bearer ${adminPayload.token}`);

		console.log('Body', userBannedRes.body);

		expect(userBannedRes.status).toBe(200);
		expect(userBannedRes.body).toHaveProperty('is_banned');
		expect(userBannedRes.body.is_banned).toBe(true);
	});

	test('A should still be able to Post and see his own post', async () => {
		const postPayload = {
			title: 'Shadowban post after',
			body_md: 'Shadowban post after',
			url: 'http://example.com',
			category_id: CategoryId,
		};
		const postRes = await request(app)
			.post(postBaseURL)
			.set('Authorization', `Bearer ${UserAPayload.token}`)
			.send(postPayload);
		expect(postRes.status).toBe(201);
		BannedPostId = postRes.body.post.id;
		BannedUserId = postRes.body.post.author_id;

		console.log('postRes', postRes.body);
		console.log('Banned User id: ', BannedUserId);

		const getPostRes = await request(app)
			.get(`${postBaseURL}?post_id=${BannedPostId}`)
			.set('Authorization', `Bearer ${UserBPayload.token}`);
		expect(getPostRes.status).toBe(200);

		console.log('getPostRes: ', getPostRes.body);
		expect(getPostRes.body.length).toBe(0);
	});
});
