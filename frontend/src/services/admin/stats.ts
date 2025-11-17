import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const instance = axios.create({
	baseURL: '/api/proxy/stats',
});

type Stat = {
	total: number;
	new_today: number;
	last_updated: string;
};

type StatsResponse = {
	users: Stat;
	posts: Stat;
	comments: Stat;
	reports: Stat;
};

const fetchStats = async (): Promise<StatsResponse> => {
	const res = await instance.get('/');
	return res.data;
};

export const useStats = () => {
	return useQuery<StatsResponse, Error>({
		queryKey: ['admin-stats'],
		queryFn: fetchStats,
	});
};

type DailyPost = {
	date: string;
	count: number;
	day_label: string;
};

type DailyPostResponse = {
	data: DailyPost[];
	period_days: number;
	start_date: string;
	end_date: string;
};

const fetchDailyPosts = async (
	days: number | undefined
): Promise<DailyPostResponse> => {
	const res = await instance.get('/daily-post-activity', {
		params: {
			days: days,
		},
	});
	return res.data;
};

export const useDailyPosts = (days?: number) => {
	return useQuery<DailyPostResponse, Error>({
		queryKey: ['daily-post-activity', days],
		queryFn: () => fetchDailyPosts(days),
	});
};

type DailyReport = {
	date: string;
	count: number;
	day_label: string;
};

type DailyReportResponse = {
	data: DailyReport[];
	period_days: number;
	start_date: string;
	end_date: string;
};

const fetchDailyReport = async (
	days: number | undefined
): Promise<DailyReportResponse> => {
	const res = await instance.get('/daily-report-activity', {
		params: {
			days: days,
		},
	});
	return res.data;
};

export const useDailyReport = (days?: number) => {
	return useQuery<DailyReportResponse, Error>({
		queryKey: ['daily-report-activity', days],
		queryFn: () => fetchDailyReport(days),
	});
};
