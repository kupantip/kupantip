import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getSession } from 'next-auth/react';

const instance = axios.create({
	baseURL: '/api/proxy/report',
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

export type ReportStatus = 'actioned' | 'dismissed' | 'open';

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

const updateReportStatus = async ({
	id,
	status,
}: {
	id: string;
	status: ReportStatus;
}): Promise<Report> => {
	const session = await getSession();
	const res = await instance.patch(
		`/${id}`,
		{ status },
		{
			headers: {
				Authorization: `Bearer ${session?.accessToken}`,
			},
		}
	);
	return res.data;
};

// Use Mutation is cleaner krub
export const useUpdateReportStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateReportStatus,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['report'] });
		},
	});
};
