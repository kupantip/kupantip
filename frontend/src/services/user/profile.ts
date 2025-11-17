import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

const instance = axios.create({
	baseURL: '/api/proxy/profile',
	timeout: 5000,
});

export type UserProfile = {
	user_id: string;
	bio: string;
	interests: string;
	skills: string;
	created_at: string;
	updated_at: string;
};

export type UpdateProfileInput = {
	bio: string;
	interests: string;
	skills: string;
};

export type UpdateProfileResponse = {
	message: string;
	profile?: UserProfile;
};

export async function fetchProfileByUserId(
	user_id: string
): Promise<UserProfile> {
	const session = await getSession();
	const header = {
		Authorization: `Bearer ${session?.user?.accessToken}`,
	};
	try {
		const response = await instance.get<UserProfile>(`/${user_id}`, {
			headers: header,
		});
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to fetch profile: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}

export function useProfileByUserId(user_id: string) {
	return useQuery<UserProfile, Error>({
		queryKey: ['profileUserId', user_id],
		queryFn: () => fetchProfileByUserId(user_id),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export async function fetchUpdateProfile(
	data: UpdateProfileInput
): Promise<UpdateProfileResponse> {
	const session = await getSession();
	const token = session?.user?.accessToken;

	if (!token) {
		return { message: 'No token provided' };
	}

	try {
		const response = await instance.put<UpdateProfileResponse>(
			'/me',
			data,
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Failed to update profile: ${error.response?.status} ${error.response?.statusText}`
			);
		} else if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(String(error));
		}
	}
}
