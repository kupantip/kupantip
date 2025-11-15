import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

const baseURL = '/api/v1/post';
describe('Get Post test', () => {
	test('Should be able to get post with anonymous', async () => {
		const response = await request(app).get(`${baseURL}`);
		expect(response.status).toBe(200);
	});
});
