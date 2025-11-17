import axios from 'axios';
import { getSession } from 'next-auth/react';

interface voteCommentData {
	commentId: string;
	value: number;
}

const instance = axios.create({
	baseURL: '/api/proxy/comment-vote',
	timeout: 5000,
});

export async function fetchVoteComment(data: voteCommentData) {
	const session = await getSession();
	const token = session?.user.accessToken;

	const res = await instance.post(
		`/` + data.commentId,
		{ value: data.value },
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);
	return res.data;
}

export async function fetchDeletevoteComment(commentId: string) {
	const session = await getSession();
	const token = session?.user.accessToken;

	const res = await instance.delete(`/${commentId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.data;
}
