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

interface voteCommentData {
	commentId: string;
	value: number;
}

export async function voteComment(data: voteCommentData) {
	const res = await fetch(`${BACKEND_HOST}/comment-vote/${data.commentId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify({ value: data.value }),
	});

	if (!res.ok) {
		throw new Error(`Failed to upvote/downvote: ${res.status}`);
	}

	return res.json();
}

export async function deletevoteComment(commentId: string) {
	const res = await fetch(`${BACKEND_HOST}/comment-vote/${commentId}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	});

	if (!res.ok) {
		throw new Error(`Failed to deletevote: ${res.status}`);
	}

	return res.json();
}

export function useUserVote(postId: string, currentuser_id: string) {
	const userID = currentuser_id;
	const [userVote, setUserVote] = useState<number>(0);

	useEffect(() => {
		const storedVotes = JSON.parse(
			localStorage.getItem(`userVotes_${userID}`) || '{}'
		);
		setUserVote(storedVotes[postId] || 0);
	}, [postId, userID]);

	const updateUserVote = (newVote: number) => {
		const storedVotes = JSON.parse(
			localStorage.getItem(`userVotes_${userID}`) || '{}'
		);
		const updatedVotes = { ...storedVotes, [postId]: newVote };
		localStorage.setItem(
			`userVotes_${userID}`,
			JSON.stringify(updatedVotes)
		);
		setUserVote(newVote);
	};

	return { userVote, updateUserVote };
}
