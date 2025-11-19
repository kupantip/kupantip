'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchSignupUser } from '@/services/user/auth';

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
			const result = await fetchSignupUser(formData);
			router.push('/login');
			console.log('Sign up success:', result);
		} catch (error) {
			console.error('Error signing up:', error);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-400 p-6 flex justify-center items-start'>
			<div className='bg-white max-w-6xl w-full rounded-lg shadow-lg p-8'>
				<div>
					<h1 className="text-2xl font-semibold">Welcome to KU Pantip</h1>
					<p className="text-sm text-gray-500">Wed, 19 November 2025</p>
				</div>
				<div className='flex flex-col gap-8 p-8'>
					<div className="flex items-center gap-3">
						<Avatar className="w-16 h-16 border-3 border-emerald-600 dark:border-emerald-700">
							<AvatarImage
								src={`https://api.dicebear.com/7.x/initials/svg?seed=${'Pattadon'}`}
							/>
							<AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
								{'Pattadon'.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>

						<div className="flex-1 flex flex-col text-sm gap-1">
							<span className="font-semibold">
								Pattadon
							</span>
							<span className="text-gray-400">
								pattadon@gmail.com
							</span>
						</div>
					</div>
					<form className='grid grid-cols-2 gap-6'>
						<div>
							<label className="text-sm font-medium">Username</label>
							<Input
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Username"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Display Name</label>
							<Input
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Display Name"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Email</label>
							<Input
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Email"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Password</label>
							<Input
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Password"
							/>
						</div>
					</form>
				</div>
				<div>
					<h1 className="text-2xl font-semibold">About Me</h1>
				</div>
				<div className='mt-4'>
					<form className='relative flex flex-col gap-6'>
						<div>
							<label className="text-sm font-medium">Bio</label>
							<Input
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Username"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Interesing</label>
							<Input
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Display Name"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Description</label>
							<Input
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Email"
							/>
						</div>

						<div className='relative ml-auto'>
							<Button className='bg-emerald-600 hover:bg-emerald-700'>
								Sign Up
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
