import axios from 'axios';
import { getSession } from 'next-auth/react';

type reportData = {
	target_type: string;
	target_id: string;
	reason: string;
};

const instance = axios.create({
	baseURL: '/api/proxy/report',
});

export async function fetchCreateReport(data: reportData) {
	const session = await getSession();
	const token = session?.user?.accessToken;

	const res = await instance.post('/', data, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});

	return res.data;
}
