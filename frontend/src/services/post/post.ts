import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { BanResponse } from '@/types/dashboard/user';
import * as t from '@/types/dashboard/post';

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

export type CreatePostData = {
	title: string;
	body_md: string;
	url: string;
	category_id: string;
	files: File[];
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

type updatePostData = {
	title: string;
	body_md: string;
	category_id?: string;
	files: File[];
};

const instance = axios.create({
	baseURL: '/api/proxy/post',
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

		const response = await instance.get<SummaryStat[]>('/summarystats', {
			headers: header,
		});
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

export async function fetchCreatePost(data: CreatePostData) {
	const formData = new FormData();
	formData.append('title', data.title);
	formData.append('body_md', data.body_md);
	formData.append('url', data.url);
	if (data.category_id) {
		formData.append('category_id', data.category_id);
	}

	data.files.forEach((file) => {
		formData.append('files', file);
	});

	const session = await getSession();
	const token = session?.user?.accessToken;

	try {
		const res = await instance.post('/', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: token ? `Bearer ${token}` : '',
			},
		});
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			const errorData = error.response.data as BanResponse;
			const err = new Error(
				errorData?.message ?? 'Failed to post comment'
			);
			if (errorData) {
				(err as Error & BanResponse).reason = errorData.reason;
				(err as Error & BanResponse).end_at = errorData.end_at;
				(err as Error & BanResponse).status = error.response.status;
			}
			throw err;
		}
		throw error;
	}
}

export async function fetchDeletePost(postId: string) {
	const session = await getSession();
	const token = session?.user?.accessToken;

	try {
		const res = await instance.delete(`/${postId}`, {
			headers: {
				Authorization: token ? `Bearer ${token}` : '',
			},
		});
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			const errorData = error.response.data as BanResponse;
			const err = new Error(
				errorData?.message ?? 'Failed to delete post'
			);
			if (errorData) {
				(err as Error & BanResponse).reason = errorData.reason;
				(err as Error & BanResponse).end_at = errorData.end_at;
				(err as Error & BanResponse).status = error.response.status;
			}
			throw err;
		}
		throw error;
	}
}

export async function fetchUpdatePost(data: updatePostData, postID: string) {
	const formData = new FormData();
	formData.append('title', data.title);
	formData.append('body_md', data.body_md);
	if (data.category_id) {
		formData.append('category_id', data.category_id);
	}

	data.files.forEach((file) => {
		formData.append('files', file);
	});

	const session = await getSession();
	const token = session?.user?.accessToken;

	const res = await instance.put(`/${postID}`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
			Authorization: token ? `Bearer ${token}` : '',
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

export async function fetchPostById(post_id: string): Promise<t.Post[]> {
	try {
		const session = await getSession();
		const token = session?.user?.accessToken;

		const response = await instance.get<t.Post[]>('/', {
			headers: {
				Authorization: token ? `Bearer ${token}` : '',
			},
			params: { post_id },
		});

		return response.data;
	} catch (err: unknown) {
		if (err instanceof Error) {
			throw new Error(err.message);
		} else {
			throw new Error(String(err));
		}
	}
}

export function usePostById(post_id: string) {
	return useQuery<t.Post[], Error>({
		queryKey: ['post', post_id],
		queryFn: () => fetchPostById(post_id),
		staleTime: 5 * 60 * 1000,
		enabled: !!post_id,
	});
}
