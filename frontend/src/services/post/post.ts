import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

export type Attachment = {
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

export type AdminPost = {
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
	minutes_since_announced: number;
	comment_count: number;
	vote_count: number;
	vote_score: number;
	like_count: number;
	dislike_count: number;
	liked_by_requesting_user: boolean;
	disliked_by_requesting_user: boolean;
	author_role: string;
	author_display_name: string;
};

export type SummaryStat = {
	category_id: string;
	category_label: string;
	category_color: string;
	post_count: number;
	total_vote_count: number;
	total_comment: number;
	total_engagement: number;
};


const instance = axios.create({
	baseURL: '/backend/post',
	timeout: 5000,
});

export async function fetchPosts(category_id: string | null): Promise<Post[]> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<Post[]>('/', {
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
		// staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export const fetchPostDetailById = async (post_id: string): Promise<Post> => {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<Post[]>('/', {
			headers: header,
			params: { post_id },
		});
		if (response.data.length === 0) {
			throw new Error('Post not found');
		}
		return response.data[0];
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch post detail: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
};

export function usePostDetail(post_id: string) {
	return useQuery<Post, Error>({
		queryKey: ['postDetail', post_id],
		queryFn: () => fetchPostDetailById(post_id),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export const fetchPostByUserId = async (user_id: string): Promise<Post[]> => {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<Post[]>('/', {
			headers: header,
			params: { user_id },
		});
		if (response.data.length === 0) {
			throw new Error('Post not found');
		}
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch post by user id: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
};

export function usePostByUserId(user_id: string) {
	return useQuery<Post[], Error>({
		queryKey: ['postUserId', user_id],
		queryFn: () => fetchPostByUserId(user_id),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export const fetchPriorityPosts = async (): Promise<Post[]> => {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<Post[]>('/priority', {
			headers: header,
		});

		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch priority posts: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
};

export function usePriorityPosts() {
	return useQuery<Post[], Error>({
		queryKey: ['priorityPosts'],
		queryFn: () => fetchPriorityPosts(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export const fetchHotPosts = async (): Promise<Post[]> => {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<Post[]>('/hot', {
			headers: header,
		});
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch hot posts: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
};

export function useHotPosts() {
	return useQuery<Post[], Error>({
		queryKey: ['hotPosts'],
		queryFn: fetchHotPosts,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnMount: 'always',
	});
}

export const fetchSummaryStats = async (): Promise<SummaryStat[]> => {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<SummaryStat[]>(
			'/summarystats',
			{
				headers: header,
			}
		);
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch summary stats: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
};

export function useSummaryStats() {
	return useQuery<SummaryStat[], Error>({
		queryKey: ['summaryStats'],
		queryFn: fetchSummaryStats,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
