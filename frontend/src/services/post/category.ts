import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

export type Category = {
	id: string;
	label: string;
	color_hex: string;
};

const instance = axios.create({
	baseURL: '/backend',
	timeout: 5000,
});

export async function fetchCategories(): Promise<Category[]> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<Category[]>('/categories', {
			headers: header,
		});
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch categories: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}

export const useCategories = () => {
	return useQuery<Category[], Error>({
		queryKey: ['categories'],
		queryFn: fetchCategories,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
