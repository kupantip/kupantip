import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const categoryBaseURL = '/api/v1/categories';
const commentBaseURL = '/api/v1/comment';
const postBaseURL = '/api/v1/post';
const commentVoteBaseURL = '/api/v1/comment-vote';

const adminPayload = {
	email: 'admin@admin.com',
	password: 'Admin@1234',
	token: '',
};

describe('Comment Test Flow', () => {
	const UserAPayload = {
		email: 'a@user.com',
		password: 'Auser@1234',
		token: '',
	};
	let CategoryId = '';
	let PostId = '';
	let UserId = '';
	let CommentId = '';

	beforeAll(async () => {
		const loginResponse = await request(app)
			.post('/api/v1/user/login')
			.send({
				email: adminPayload.email,
				password: adminPayload.password,
			});
		expect(loginResponse.status).toBe(200);
		adminPayload.token = loginResponse.body.token;

		const aSignupRes = await request(app).post('/api/v1/user/signup').send({
			email: UserAPayload.email,
			password: UserAPayload.password,
			handle: 'auser',
			display_name: 'A User',
		});
		expect([200, 201]).toContain(aSignupRes.status);
		const aLoginRes = await request(app).post('/api/v1/user/login').send({
			email: UserAPayload.email,
			password: UserAPayload.password,
		});
		expect(aLoginRes.status).toBe(200);
		UserAPayload.token = aLoginRes.body.token;
	});

	test('Create new a category', async () => {
		const categoryPayload = {
			label: 'Shadow Ban Category', // Make this unique
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

	test('A create a new Post', async () => {
		const postPayload = {
			title: 'Comment Test Post',
			body_md: 'Testing Comment',
			url: 'http://example.com',
			category_id: CategoryId,
		};
		const postRes = await request(app)
			.post(postBaseURL)
			.set('Authorization', `Bearer ${UserAPayload.token}`)
			.send(postPayload);
		expect(postRes.status).toBe(201);
		expect(postRes.body).toHaveProperty('post');
		PostId = postRes.body.post.id;
		UserId = postRes.body.post.author_id;
	});

	test('A create a new Comment', async () => {
		const commentPayload = {
			parent_id: '',
			body_md: 'test comment',
		};
		const commentRes = await request(app)
			.post(`${commentBaseURL}?post_id=${PostId}`)
			.set('Authorization', `Bearer ${UserAPayload.token}`)
			.send(commentPayload);
		expect(commentRes.status).toBe(200);
		expect(commentRes.body).toHaveProperty('message');
		expect(commentRes.body).toHaveProperty('comment');
		CommentId = commentRes.body.comment.id;
	});

	test('A test edit Comment', async () => {
		const editCommentPayload = {
			body_md: 'test comment change',
		};
		const editCommentRes = await request(app)
			.put(`${commentBaseURL}/${CommentId}`)
			.set('Authorization', `Bearer ${UserAPayload.token}`)
			.send(editCommentPayload);
		expect(editCommentRes.status).toBe(200);
		expect(editCommentRes.body).toHaveProperty('message');
		expect(editCommentRes.body).toHaveProperty('comment');
	});

	test('Vote Up, Down and Delete for Comment', async () => {
		const voteUpPayload = {
			value: 1,
		};
		const voteDownPayload = {
			value: -1,
		};
		const voteUpRes = await request(app)
			.post(`${commentVoteBaseURL}/${CommentId}`)
			.set('Authorization', `Bearer ${UserAPayload.token}`)
			.send(voteUpPayload);
		expect(voteUpRes.status).toBe(200);
		expect(voteUpRes.body).toHaveProperty('message', 'Vote updated');
		expect(voteUpRes.body).toHaveProperty('comment_id', CommentId);
		expect(voteUpRes.body).toHaveProperty('user_id', UserId);
		expect(voteUpRes.body).toHaveProperty('value', 1);
		expect(voteUpRes.body).toHaveProperty('action', 'INSERT');

		const voteDeleteRes = await request(app)
			.delete(`${commentVoteBaseURL}/${CommentId}`)
			.set('Authorization', `Bearer ${UserAPayload.token}`);
		expect(voteDeleteRes.status).toBe(200);
		expect(voteDeleteRes.body).toHaveProperty('message', 'Vote deleted');
		expect(voteDeleteRes.body).toHaveProperty('comment_id', CommentId);
		expect(voteDeleteRes.body).toHaveProperty('user_id', UserId);
		expect(voteDeleteRes.body).toHaveProperty('action', 'delete');

		const voteDownRes = await request(app)
			.post(`${commentVoteBaseURL}/${CommentId}`)
			.set('Authorization', `Bearer ${UserAPayload.token}`)
			.send(voteDownPayload);
		expect(voteDownRes.status).toBe(200);
		expect(voteDownRes.body).toHaveProperty('message', 'Vote updated');
		expect(voteDownRes.body).toHaveProperty('comment_id', CommentId);
		expect(voteDownRes.body).toHaveProperty('user_id', UserId);
		expect(voteDownRes.body).toHaveProperty('value', -1);
		expect(voteDownRes.body).toHaveProperty('action', 'INSERT');
	});

	test('Delete comment', async () => {
		const deleteRes = await request(app)
			.delete(`${commentBaseURL}/${CommentId}`)
			.set('Authorization', `Bearer ${UserAPayload.token}`);
		expect(deleteRes.status).toBe(200);
		expect(deleteRes.body).toHaveProperty('message', 'Comment deleted');
	});
});
