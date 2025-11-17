import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

const instance = axios.create({
	baseURL: '/backend/requested-categories',
	timeout: 5000,
});

export type RequestedCategory = {
	id: string;
	requester_id: string;
	label: string;
	color_hex: string;
	detail: string;
	status: string;
	created_at: string;
	reviewed_at: string | null;
	reviewed_by: string | null;
	requester_name: string;
	reviewer_name: string | null;
	minutes_since_requested?: number;
};

export type CreateRequestedCategoryInput = {
	label: string;
	color_hex: string;
	detail: string;
};

export type CreateRequestedCategoryResponse =
	| {
			message: string;
			data: RequestedCategory;
	  }
	| {
			message: string;
	  };

export type PatchRequestedCategoryStatusInput = {
	status: 'open' | 'dismissed' | 'actioned';
};

export type PatchRequestedCategoryStatusResponse =
	| {
			message: string;
			data: RequestedCategory;
	  }
	| {
			message: string;
	  };

export async function fetchRequestedCategories(params?: {
	status?: 'open' | 'dismissed' | 'actioned';
	recent?: boolean;
}): Promise<RequestedCategory[]> {
	const session = await getSession();
	const header = {
		Authorization: `Bearer ${session?.user?.accessToken}`,
	};
	const query: Record<string, any> = {};
	if (params?.status) query.status = params.status;
	if (typeof params?.recent === 'boolean') query.recent = params.recent;
	const response = await instance.get<RequestedCategory[]>('/', {
		headers: header,
		params: query,
	});
	return response.data;
}

export async function fetchRequestedCategoryById(
	id: string
): Promise<RequestedCategory> {
	const session = await getSession();
	const header = {
		Authorization: `Bearer ${session?.user?.accessToken}`,
	};
	const response = await instance.get<RequestedCategory>(`/${id}`, {
		headers: header,
	});
	return response.data;
}

export async function createRequestedCategory(
	input: CreateRequestedCategoryInput
): Promise<CreateRequestedCategoryResponse> {
	const session = await getSession();
	if (!session) throw new Error('Not authenticated');
	const response = await instance.post<CreateRequestedCategoryResponse>(
		'/',
		input,
		{
			headers: {
				Authorization: `Bearer ${session.user.accessToken}`,
			},
		}
	);
	return response.data;
}

export async function patchRequestedCategoryStatus(
	id: string,
	input: PatchRequestedCategoryStatusInput
): Promise<PatchRequestedCategoryStatusResponse> {
	const session = await getSession();
	if (!session) throw new Error('Not authenticated');
	const response = await instance.patch<PatchRequestedCategoryStatusResponse>(
		`/${id}`,
		input,
		{
			headers: {
				Authorization: `Bearer ${session.user.accessToken}`,
			},
		}
	);
	return response.data;
}

export const useRequestedCategories = (params?: {
	status?: 'open' | 'dismissed' | 'actioned';
	recent?: boolean;
}) => {
	return useQuery<RequestedCategory[], Error>({
		queryKey: ['requested-categories', params],
		queryFn: () => fetchRequestedCategories(params),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};

export const useRequestedCategoryById = (id: string) => {
	return useQuery<RequestedCategory, Error>({
		queryKey: ['requested-category', id],
		queryFn: () => fetchRequestedCategoryById(id),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		enabled: !!id,
	});
};

export function useCreateRequestedCategory() {
	return useMutation<
		CreateRequestedCategoryResponse,
		Error,
		CreateRequestedCategoryInput
	>({
		mutationFn: createRequestedCategory,
	});
}

export function usePatchRequestedCategoryStatus() {
	return useMutation<
		PatchRequestedCategoryStatusResponse,
		Error,
		{ id: string; input: PatchRequestedCategoryStatusInput }
	>({
		mutationFn: ({ id, input }) => patchRequestedCategoryStatus(id, input),
	});
}
