import PasswordForm from './PasswordForm';
import axios from 'axios';

const instance = axios.create({
	baseURL:
		process.env.BACKEND_URL + '/user' || 'http://localhost:8000/api/v1',
});

async function verifyResetToken(token: string) {
	try {
		const response = await instance.get(`/reset/verify/${token}`);
		return response.data;
	} catch (error) {
		console.log('Error verifying token:', error);
		return false;
	}
}

export default async function ResetPasswordPage({
	params,
}: {
	params: { token: string };
}) {
	const { token } = params;

	const data = await verifyResetToken(token);

	if (!data.valid) {
		return (
			<main className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
					<div className="text-5xl mb-5">⚠️</div>
					<h2 className="text-2xl font-bold text-red-600 mb-3">
						Invalid Link
					</h2>
					<p className="text-gray-600 mb-6 leading-relaxed">
						This password reset link is invalid or has expired.
						Please request a new one.
					</p>
					<a
						href="/login"
						className="inline-block px-6 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition-colors"
					>
						Back to Login
					</a>
				</div>
			</main>
		);
	}

	return <PasswordForm rt_id={data.rt_id} />;
}
