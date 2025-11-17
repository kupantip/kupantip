import axios from 'axios';

export interface LoginPayload {
	email?: string;
	password?: string;
}

export type LoginResponse = {
	user_id?: string;
	role?: string;
	email?: string;
	display_name?: string;
	token: string;
};

type SignupData = {
	email: string;
	handle: string;
	display_name: string;
	password: string;
};

const instance = axios.create({
	baseURL: '/api/proxy/user',
	timeout: 5000,
});
export async function login(payload: LoginPayload): Promise<LoginResponse> {
	try {
		const res = await instance.post<LoginResponse>('/login', payload);

		return res.data;
	} catch (error) {
		throw error;
	}
}

export async function fetchSignupUser(data: SignupData) {
	try {
		const res = await instance.post('/signup', data);
		return res.data;
	} catch (err) {
		throw err;
	}
}
