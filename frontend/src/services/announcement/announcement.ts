import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

export type Announcement = {
	id: string;
	author_id: string;
	title: string;
	body_md: string;
	create_at: string;
	start_at: string;
	end_at: string;
	delete_at: string | null;
	author_handle: string;
	author_display_name: string;
	author_role: 'admin' | 'teacher' | 'staff' | 'user';
	minutes_since_announced: number;
};

export type CreateAnnouncementData = {
	title: string;
	body_md: string;
	start_at: string;
	end_at: string;
};

export type AnnouncementResponse = {
	announcements: Announcement[];
};

// Types for creating an announcement
export type CreateAnnouncementInput = {
	title: string;
	body_md: string;
	start_at: string;
	end_at: string;
};

export type CreateAnnouncementResponse = {
	message: string;
	announcement: {
		id: string;
		author_id: string;
		title: string;
		body_md: string;
		create_at: string;
		start_at: string;
		end_at: string;
		delete_at: string | null;
	};
};

const instance = axios.create({
	baseURL: '/api/proxy/announcement',
	timeout: 5000,
});

export async function fetchAnnouncement(): Promise<Announcement[]> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<AnnouncementResponse>(
			'/',
			{
				headers: header,
			}
		);

		return response.data.announcements;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch annoucement: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}

export function useAnnouncement() {
	return useQuery<Announcement[], Error>({
		queryKey: ['annoucements'],
		queryFn: () => fetchAnnouncement(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export async function fetchAnnouncementById(
	announcement_id: string
): Promise<Announcement> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<Announcement>(
			`/${announcement_id}`,
			{
				headers: header,
			}
		);
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch announcement: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}

export function useAnnouncementById(announcement_id: string) {
	return useQuery<Announcement, Error>({
		queryKey: ['announcement', announcement_id],
		queryFn: () => fetchAnnouncementById(announcement_id),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Function to post a new announcement
export async function createAnnouncement(
	input: CreateAnnouncementInput
): Promise<CreateAnnouncementResponse> {
	try {
		const session = await getSession();
		if (!session) {
			throw new Error('Not authenticated');
		}

		const response = await instance.post<CreateAnnouncementResponse>(
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

// React Query mutation hook for creating an announcement
export function useCreateAnnouncement() {
	return useMutation<
		CreateAnnouncementResponse,
		Error,
		CreateAnnouncementInput
	>({
		mutationFn: createAnnouncement,
	});
}

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
	const response = await instance.get<AnnouncementResponse>('/announcement');
	return response.data.announcements;
};

export const deleteAnnouncement = async (
	announcement_id: string
): Promise<{ message: string }> => {
	const session = await getSession();
	if (!session) {
		throw new Error('Not authenticated');
	}
	const response = await instance.delete(`/${announcement_id}`, {
		headers: {
			Authorization: `Bearer ${session.user.accessToken}`,
		},
	});
	return response.data;
};

export function useDeleteAnnouncement() {
	return useMutation<{ message: string }, Error, string>({
		mutationFn: deleteAnnouncement,
	});
}
