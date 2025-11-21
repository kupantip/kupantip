import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

export type Category = {
	id: string;
	label: string;
	color_hex: string;
	detail: string;
};

export type CreateCategoryInput = {
	label: string;
	color_hex: string;
	detail: string;
};

export type CreateCategoryResponse = {
	message: string;
	category: {
		id: string;
		label: string;
		color_hex: string;
		detail: string;
	};
};

const instance = axios.create({
	baseURL: '/api/proxy/categories',
	timeout: 5000,
});

export async function fetchCategories(): Promise<Category[]> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<Category[]>('/', {
			headers: header,
			params: { recent: false },
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

export async function fetchCategoryById(categoryId: string): Promise<Category> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<Category>(`/${categoryId}`, {
			headers: header,
		});
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch category: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}

export async function createCategory(
	input: CreateCategoryInput
): Promise<CreateCategoryResponse> {
	try {
		const session = await getSession();
		if (!session) {
			throw new Error('Not authenticated');
		}

		const response = await instance.post<CreateCategoryResponse>(
			'/',
			input,
			{
				headers: {
					Authorization: `Bearer ${session.user.accessToken}`,
				},
			}
		);

		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			const errorMessage =
				error.response?.data?.message ||
				`Failed to create announcement: ${error.response?.status} ${error.response?.statusText}`;
			throw new Error(errorMessage);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(
				'An unknown error occurred while creating the announcement.'
			);
		}
	}
}

export const useCategories = () => {
	return useQuery<Category[], Error>({
		queryKey: ['categories'],
		queryFn: fetchCategories,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes cache time (formerly cacheTime)
		refetchOnMount: true, // Don't refetch when component mounts if data exists
		refetchOnWindowFocus: true, // Don't refetch when window regains focus
	});
};

export const useCategoryById = (categoryId: string) => {
	return useQuery<Category, Error>({
		queryKey: ['category', categoryId],
		queryFn: () => fetchCategoryById(categoryId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes cache time
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		enabled: !!categoryId, // Only fetch if categoryId is provided
	});
};

export function useCreateCategory() {
	return useMutation<CreateCategoryResponse, Error, CreateCategoryInput>({
		mutationFn: createCategory,
	});
}
