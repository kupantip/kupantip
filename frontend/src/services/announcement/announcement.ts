import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { Post } from '../post/post';
import { AdminPost } from '../post/post';

const instance = axios.create({
	baseURL: '/backend',
	timeout: 5000,
});

export async function fetchAnnouncements(): Promise<AdminPost[]> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<{ announcements: AdminPost[] }>(
			'/announcement',
			{
				headers: header,
			}
		);
		return response.data.announcements;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch announcements: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}

export function useAnnouncements() {
	return useQuery<AdminPost[], Error>({
		queryKey: ['announcements'],
		queryFn: fetchAnnouncements,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnMount: 'always',
	});
}

export type AnnouncementDetail = {
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
	author_role: string;
	minutes_since_announced: number;
};

export async function fetchAnnouncementById(
	announcement_id: string
): Promise<AnnouncementDetail> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<AnnouncementDetail>(
			`/announcement/${announcement_id}`,
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
	return useQuery<AnnouncementDetail, Error>({
		queryKey: ['announcement', announcement_id],
		queryFn: () => fetchAnnouncementById(announcement_id),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export type CreateAnnouncementData = {
	title: string;
	body_md: string;
	start_at: string;
	end_at: string;
};

export const createAnnouncement = async (data: CreateAnnouncementData) => {
	try {
		const session = await getSession();
		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};
		const response = await instance.post('/announcement', data, {
			headers: header,
		});
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to create announcement: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
};
