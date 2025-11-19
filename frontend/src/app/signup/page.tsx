'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchSignupUser } from '@/services/user/auth';
import { toast } from 'sonner';


export default function SignUp() {
	const [formData, setFormData] = useState({
		email: '',
		handle: '',
		display_name: '',
		password: '',
	});

	const router = useRouter();
	const [ErrorMessage, setErrorMessage] = useState('');
	const [isError, setIsError] = useState(false);

	const [PasswordErrorMessage, setPasswordErrorMessage] = useState('');
	const [isPasswordError, setIsPasswordError] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsError(false);
		setIsPasswordError(false);
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			// setIsError(false);
			const result = await fetchSignupUser(formData);
			router.push('/login');
			toast.success('Sign up Successfully!')
			console.log('Sign up success:', result);
		} catch (err) {
			console.error('Error signing up:', err);
			if (err && typeof err === 'object') {
				const e = err as {
					message?: string;
					errors?: { message: string }[];
				};

				if (e.errors && Array.isArray(e.errors)) {
					const combined = (
						<div>
							{e.errors.map((item, idx) => (
								<div key={idx}>• {item.message}</div>
							))}
						</div>
					);
					setIsPasswordError(true);
					setPasswordErrorMessage(combined as unknown as string);
					return;
				}

				if (e.message) {
					toast.error(e.message);
					setErrorMessage('Email or Username already exists');
					setIsError(true)
					return;
				}
			}
			
			toast.error('Sign up Fail', {
				description: 'Unable to sign up. Please try again.',
			});
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-400 p-6 flex justify-center items-start'>
			<div className='bg-white max-w-2xl w-full rounded-lg shadow-lg p-8'>
				<div className='flex'>
					<h1 className="text-3xl font-bold m-auto">Profile</h1>
					{/* <p className="text-sm text-gray-500 m-auto">Wed, 19 November 2025</p> */}
				</div>
				<div className='flex flex-col gap-8 py-6'>
					<div className="flex items-center gap-3">
						<Avatar className="m-auto w-24 h-24 border-3 border-emerald-600 dark:border-emerald-700">
							<AvatarImage
								src={`https://api.dicebear.com/7.x/initials/svg?seed=${'Pattadon'}`}
							/>
							<AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
								{'Pattadon'.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>

						{/* <div className="flex-1 flex flex-col text-sm gap-1">
							<span className="font-semibold">
								Pattadon
							</span>
							<span className="text-gray-400">
								pattadon@gmail.com
							</span>
						</div> */}
					</div>
					<form onSubmit={handleSubmit} className='flex flex-col gap-6'>
						<div>
							<label className="text-sm font-medium">Email</label>
							<Input
								type='email'
								name='email'
								value={formData.email}
								onChange={handleChange}
								required
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Email"
							/>
							{isError && (
								<div className='ml-2 mt-1'>
									<p className='text-sm text-red-500'>{ErrorMessage}</p>
								</div>
							)}
						</div>
						<div>
							<label className="text-sm font-medium">Username</label>
							<Input
								type='text'
								name='handle'
								value={formData.handle}
								onChange={handleChange}
								required
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Username"
							/>
							{isError && (
								<div className='ml-2 mt-1'>
									<p className='text-sm text-red-500'>{ErrorMessage}</p>
								</div>
							)}
						</div>
						<div>
							<label className="text-sm font-medium">Display Name</label>
							<Input
								type='text'
								name='display_name'
								value={formData.display_name}
								onChange={handleChange}
								required
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Display Name"
							/>
						</div>

						<div>
							<label className="text-sm font-medium">Password</label>
							<Input
								type='password'
								name='password'
								value={formData.password}
								onChange={handleChange}
								required
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Your Password"
							/>
							{isPasswordError && (
								<div className='ml-2 mt-1'>
									<p className='text-sm text-red-500'>{PasswordErrorMessage}</p>
								</div>
							)}
						</div>
							<Button
								type='submit' 
								className='bg-emerald-600 hover:bg-emerald-700'>
								Sign Up
							</Button>
					</form>
				</div>
				<div className='flex'>
					<h1 className="text-2xl font-semibold m-auto">About Me</h1>
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
{/* 
						<div className='relative ml-auto'>
							<Button
								type='submit' 
								className='bg-emerald-600 hover:bg-emerald-700'>
								Sign Up
							</Button>
						</div> */}
					</form>
				</div>
			</div>
		</div>
	);
}
