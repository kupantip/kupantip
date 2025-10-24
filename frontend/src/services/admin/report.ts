import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getSession } from 'next-auth/react';

const instance = axios.create({
	baseURL: '/backend/report',
});

export type Report = {
	id: string;
	target_type: string;
	target_id: string;
	reporter_id: string;
	reason: string;
	created_at: string;
	status: string;
	minutes_since_reported: number;
	reported_user_id: string;
};

const fetchReports = async (): Promise<Report[]> => {
	const session = await getSession();
	const res = await instance.get('/', {
		headers: {
			Authorization: `Bearer ${session?.accessToken}`,
		},
	});
	return res.data;
};

export const useReports = () => {
	return useQuery<Report[], Error>({
		queryKey: ['report'],
		queryFn: fetchReports,
	});
};
