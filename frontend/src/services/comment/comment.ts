import { BanResponse } from '@/types/dashboard/user';
import axios from 'axios';
import { getSession } from 'next-auth/react';

type updateCommentData = {
	id: string;
	body_md: string;
};

const instance = axios.create({
	baseURL: '/api/proxy/comment',
	timeout: 5000,
});

export async function fetchUpdateComment(data: updateCommentData) {
	const body = {
		body_md: data.body_md,
	};

	const session = await getSession();

	const token = session?.user?.accessToken;
	const res = await instance.put(`/${data.id}`, body, {
		headers: {
			Authorization: `Bearer ${token}`,
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
