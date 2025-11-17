import * as t from '@/types/dashboard/post';
import { getSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const instance = axios.create({
	baseURL: '/api/proxy/comment',
	timeout: 5000,
});

export async function getCommentByPostId(
	post_id: string
): Promise<t.CommentsResponse> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<t.CommentsResponse>(
			`/comment?post_id=${post_id}`,
			{
				headers: header,
			}
		);
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
		queryFn: () => getCommentByPostId(post_id),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!post_id,
	});
}
