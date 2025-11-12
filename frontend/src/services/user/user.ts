import axios from 'axios';

const instance = axios.create({
	baseURL: '/backend/user',
	withCredentials: true,
});

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
