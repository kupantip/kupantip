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
	bio?: string,
	interests?: string,
	skills?: string
};

const instance = axios.create({
	baseURL: '/api/proxy/user',
	timeout: 5000,
});
export async function login(payload: LoginPayload): Promise<LoginResponse> {
	try {
		const baseURL = process.env.BACKEND_URL || '';
		const url = baseURL + '/user/login';
		const res = await axios.post<LoginResponse>(url, payload);
		return res.data;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function fetchSignupUser(data: SignupData) {
	try {
		const res = await instance.post('/signup', data);
		return res.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			throw err.response?.data;
		}
	}
}
