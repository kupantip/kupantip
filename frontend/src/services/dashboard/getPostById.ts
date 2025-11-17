import * as t from '@/types/dashboard/post';
import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import axios from 'axios';

const instance = axios.create({
	baseURL: '/backend',
	timeout: 5000,
});
export async function getPostById(post_id: string): Promise<t.Post[]> {
	try {
		const session = await getSession();
		const token = session?.user?.accessToken;

		const response = await instance.get<t.Post[]>(
			`/post?post_id=${post_id}`,
			{
				headers: {
					Authorization: token ? `Bearer ${token}` : '',
				},
			}
		);

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
		queryFn: () => getPostById(post_id),
		staleTime: 5 * 60 * 1000,
		enabled: !!post_id,
	});
}
