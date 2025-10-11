'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { signupUser } from '../api/signup_page';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
	const [formData, setFormData] = useState({
		email: '',
		handle: '',
		display_name: '',
		password: '',
	});

	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const result = await signupUser(formData);
			router.push('/login');
			console.log('Sign up success:', result);
		} catch (error) {
			console.error('Error signing up:', error);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6 text-center">Sign up</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<Input
						type="email"
						name="email"
						placeholder="Email"
						value={formData.email}
						onChange={handleChange}
						required
						className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<Input
						type="text"
						name="handle"
						placeholder="Username"
						value={formData.handle}
						onChange={handleChange}
						required
						className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<Input
						type="text"
						name="display_name"
						placeholder="Display name"
						value={formData.display_name}
						onChange={handleChange}
						required
						className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<Input
						type="password"
						name="password"
						placeholder="Password"
						value={formData.password}
						onChange={handleChange}
						required
						className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="submit"
						className="bg-emerald-800 text-white font-bold py-2 rounded-lg hover:bg-emerald-900"
					>
						Sign Up
					</button>
				</form>

				<div className="my-4 flex items-center">
					<div className="flex-grow border-t border-gray-300"></div>
					<span className="px-2 text-gray-500 text-sm">OR</span>
					<div className="flex-grow border-t border-gray-300"></div>
				</div>

				<p className="text-sm text-center mt-4">
					Already have an account?{' '}
					<Link
						href="/login"
						className="text-blue-500 hover:underline "
					>
						Log In
					</Link>
				</p>
			</div>
		</div>
	);
}
