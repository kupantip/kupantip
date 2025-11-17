import { BanResponse } from '@/types/dashboard/user';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import * as t from '@/types/dashboard/post';

type updateCommentData = {
	id: string;
	body_md: string;
};

const instance = axios.create({
	baseURL: '/api/proxy/comment',
	timeout: 5000,
});

export async function fetchUpdateComment(data: updateCommentData) {
	const body = {
		body_md: data.body_md,
	};

	const session = await getSession();

	const token = session?.user?.accessToken;
	const res = await instance.put(`/${data.id}`, body, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.status.toString().startsWith('2')) {
		let errorData: BanResponse | null = null;
		errorData = res.data as BanResponse;
		const error = new Error(errorData?.message ?? 'Failed to post comment');
		if (errorData) {
			(error as Error & BanResponse).reason = errorData.reason;
			(error as Error & BanResponse).end_at = errorData.end_at;
			(error as Error & BanResponse).status = res.status;
		}
		throw error;
	}

	return res.data;
}

export async function fetchDeleteComment(commentId: string) {
	const session = await getSession();

	const token = session?.user?.accessToken;
	const res = await instance.delete(`/${commentId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.status.toString().startsWith('2')) {
		let errorData: BanResponse | null = null;
		errorData = res.data as BanResponse;
		const error = new Error(
			errorData?.message ?? 'Failed to delete comment'
		);
		if (errorData) {
			(error as Error & BanResponse).reason = errorData.reason;
			(error as Error & BanResponse).end_at = errorData.end_at;
			(error as Error & BanResponse).status = res.status;
		}
		throw error;
	}

	return res.data;
}

export async function fetchCommentByPostId(
	post_id: string
): Promise<t.CommentsResponse> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<t.CommentsResponse>('/', {
			headers: header,
			params: { post_id },
		});
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch comments: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}

export function useCommentsByPostId(post_id: string) {
	return useQuery<t.CommentsResponse, Error>({
		queryKey: ['comments', post_id],
		queryFn: () => fetchCommentByPostId(post_id),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!post_id,
	});
}

interface Content {
	post_id: string;
	parent_id: string;
	body_md: string;
}

export async function fetchPostComment(body: {
	content: Content;
}): Promise<boolean> {
	try {
		const session = await getSession();

		const response = await instance.post('/', body.content, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session?.user?.accessToken}`,
			},
			params: { post_id: body.content.post_id },
		});

		return true;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			const errorData = error.response?.data as BanResponse | undefined;
			const err = new Error(
				errorData?.message ?? 'Failed to post comment'
			);
			if (errorData) {
				(err as Error & BanResponse).reason = errorData.reason;
				(err as Error & BanResponse).end_at = errorData.end_at;
				(err as Error & BanResponse).status =
					error.response?.status || 500;
			}
			throw err;
		}
		if (error instanceof Error) {
			throw error;
		}
		throw new Error(String(error));
	}
}

export function usePostComment() {
	return useMutation<
		boolean,
		Error & Partial<BanResponse>,
		{ content: Content }
	>({
		mutationFn: fetchPostComment,
	});
}
