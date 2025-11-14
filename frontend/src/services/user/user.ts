import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

const instance = axios.create({
	baseURL: '/backend/user',
	withCredentials: true,
});

export type UserStats = {
	user_id: string;
	handle: string;
	display_name: string;
	email: string;
	role: string;
	created_at: string;
	posts_count: number;
	comments_count: number;
	upvotes_given: number;
	downvotes_given: number;
	upvotes_received: number;
	downvotes_received: number;
};

export async function fetchUserStats(user_id: string): Promise<UserStats> {
	try {
		const session = await getSession();

		const header = {
			Authorization: `Bearer ${session?.user?.accessToken}`,
		};

		const response = await instance.get<UserStats>(`/stats/${user_id}`, {
			headers: header,
		});

		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch user stats: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}

export function useUserStats(user_id: string) {
	return useQuery<UserStats, Error>({
		queryKey: ['userStats', user_id],
		queryFn: () => fetchUserStats(user_id),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!user_id,
	});
}

export async function sendPasswordResetEmail(email: string) {
	try {
		const response = await instance.post('/forget', {
			email,
		});
		if (response.status === 200) {
			return { success: true };
		} else {
			return { success: false, error: 'Failed to send reset link' };
		}
	} catch (error) {
		console.log(error);
		if (axios.isAxiosError(error) && error.response) {
			return {
				success: false,
				error: error.response.data.message || 'An error occurred',
			};
		}
		return { success: false, error: 'An unknown error occurred' };
	}
}

export async function resetPassword(rt_id: string, newPassword: string) {
	try {
		const response = await instance.put(`/reset/${rt_id}`, {
			new_password: newPassword,
		});
		if (response.status === 200) {
			return { success: true };
		} else {
			return { success: false, error: 'Failed to reset password' };
		}
	} catch (error) {
		console.log(error);
		if (axios.isAxiosError(error) && error.response) {
			return {
				success: false,
				error: error.response.data.message || 'An error occurred',
			};
		}
		return { success: false, error: 'An unknown error occurred' };
	}
}
