import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

type Attachment = {
	id: string;
	url: string;
	mime_type: string;
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
	category_color: string;
	category_id: string;
	attachments: Attachment[];
	minutes_since_posted: number;
	comment_count: number;
	vote_count: number;
	vote_score: number;
	like_count: number;
	dislike_count: number;
	liked_by_requesting_user: boolean;
	disliked_by_requesting_user: boolean;
};

const instance = axios.create({
	baseURL: '/backend',
	timeout: 5000,
});

export async function fetchPosts(category_id: string | null): Promise<Post[]> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<Post[]>('/post', {
			headers: header,
			params: category_id ? { category_id } : {},
		});
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch posts: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}

export function usePosts(category_id: string | null) {
	return useQuery<Post[], Error>({
		queryKey: ['posts', category_id],
		queryFn: () => fetchPosts(category_id),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
