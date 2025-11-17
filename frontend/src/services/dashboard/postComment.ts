import { BanResponse } from '@/types/dashboard/user';
import { getSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const instance = axios.create({
	baseURL: '/backend',
	timeout: 5000,
});

interface Content {
	post_id: string;
	parent_id: string;
	body_md: string;
}

export async function postComment(body: {
	content: Content;
}): Promise<boolean> {
	try {
		const session = await getSession();

		const response = await instance.post(
			`/comment?post_id=${body.content.post_id}`,
			body.content,
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session?.user?.accessToken}`,
				},
			}
		);

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
		mutationFn: postComment,
	});
}
