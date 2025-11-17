import axios from 'axios';
import { getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

interface votePostData {
	postId: string;
	value: number;
}

const instance = axios.create({
	baseURL: '/api/proxy/post-vote',
	withCredentials: true,
});

export async function fetchUpvotePost(postId: string) {
	const session = await getSession();
	const res = await instance.post(
		`/` + postId,
		{ value: 1 },
		{
			headers: {
				Authorization: `Bearer ${session?.accessToken}`,
			},
		}
	);
	return res.data;
}

export async function fetchDownvotePost(postId: string) {
	const session = await getSession();
	const res = await instance.post(
		`/` + postId,
		{ value: -1 },
		{
			headers: {
				Authorization: `Bearer ${session?.accessToken}`,
			},
		}
	);
	return res.data;
}

export async function fetchDeletevotePost(postId: string) {
	const session = await getSession();
	const res = await instance.delete(`/${postId}`, {
		headers: {
			Authorization: `Bearer ${session?.accessToken}`,
		},
	});
	return res.data;
}
