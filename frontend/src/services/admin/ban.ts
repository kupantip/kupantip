import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const instance = axios.create({
	baseURL: '/backend/ban',
});

// Types
interface CreateBanBody {
	user_id: string;
	ban_type: string;
	reason_admin: string;
	reason_user: string;
	related_report_id: string;
}

interface UpdateBanBody {
	ban_type: string;
	end_at: string;
}

interface RevokeBanBody {
	reason_admin: string;
}

// POST - Create ban
export const useCreateBan = () => {
	return useMutation({
		mutationFn: async (body: CreateBanBody) => {
			const { data } = await instance.post('/', body);
			return data;
		},
	});
};

// PATCH - Update ban
export const useUpdateBan = () => {
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: string;
			body: UpdateBanBody;
		}) => {
			const { data } = await instance.patch(`/${id}`, body);
			return data;
		},
	});
};

// GET - Get bans
export const useGetBans = () => {
	return useQuery({
		queryKey: ['bans'],
		queryFn: async () => {
			const { data } = await instance.get('/');
			return data;
		},
	});
};

// PATCH - Revoke ban
export const useRevokeBan = () => {
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: string;
			body: RevokeBanBody;
		}) => {
			const { data } = await instance.patch(`/revoke/${id}`, body);
			return data;
		},
	});
};
