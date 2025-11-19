'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchSignupUser } from '@/services/user/auth';
import { toast } from 'sonner';
import {
	useProfileByUserId,
	fetchUpdateProfile,
	UpdateProfileInput,
} from '@/services/user/profile';


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

	const [form, setForm] = useState<UpdateProfileInput>({
		bio: '',
		interests: '',
		skills: '',
	});
	const [interests, setInterests] = useState<string[]>([]);
	const [skills, setSkills] = useState<string[]>([]);
	const [interestInput, setInterestInput] = useState('');
	const [skillInput, setSkillInput] = useState('');

	const handleAddInterest = () => {
		const value = interestInput.trim();
		if (value && !interests.includes(value)) {
			setInterests([...interests, value]);
			setInterestInput('');
		}
	};

	const handleRemoveInterest = (idx: number) => {
		setInterests(interests.filter((_, i) => i !== idx));
	};

	const handleAddSkill = () => {
		const value = skillInput.trim();
		if (value && !skills.includes(value)) {
			setSkills([...skills, value]);
			setSkillInput('');
		}
	};

	const handleRemoveSkill = (idx: number) => {
		setSkills(skills.filter((_, i) => i !== idx));
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsError(false);
		setIsPasswordError(false);
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
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
		<div className='min-h-screen bg-gray-100 p-6 flex justify-center items-center'>
			<div className='bg-white max-w-2xl w-full rounded-lg shadow-lg p-8'>
				<div className='flex'>
					<h1 className="text-4xl font-bold m-auto">Profile</h1>
				</div>
				<div className='flex flex-col gap-8 py-6'>
					<div className="flex items-center gap-3">
						<Avatar className="m-auto w-24 h-24 border-3 border-emerald-600 dark:border-emerald-700">
							<AvatarImage
								src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.display_name}`}
							/>
							<AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
								{'Pattadon'.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</div>
					<form id="signupForm" onSubmit={handleSubmit} className='flex flex-col gap-6'>
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
							className='bg-emerald-600 hover:bg-emerald-700 w-full cursor-pointer'>
							Sign Up
						</Button>
					</form>
				</div>
				<div className='flex'>
					<h1 className="text-2xl font-semibold m-auto">About Me</h1>
				</div>
				<div className='mt-4'>
					<form className='relative flex flex-col gap-6'>
						{/* <div>
							<label className="text-sm font-medium">Bio</label>
							<Textarea
								className="w-full mt-1 border rounded-xl p-3 text-sm"
								placeholder="Tell us about yourself"
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
						</div> */}
						{/* <div>
							<label className="block mb-1 font-medium">Bio</label>
							<Textarea
								name="bio"
								value={form.bio}
								rows={3}
								placeholder="Tell us about yourself"
								required
							/>
						</div>
						<div>
							<label className="block mb-1 font-medium">
								Interests
							</label>
							<div className="flex gap-2 mb-2">
								<Input
									name="interestInput"
									value={interestInput}
									onChange={(e) =>
										setInterestInput(e.target.value)
									}
									placeholder="Add an interest"
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleAddInterest();
										}
									}}
								/>
								<Button
									type="button"
									onClick={handleAddInterest}
									disabled={!interestInput.trim()}
									className='cursor-pointer bg-emerald-600 hover:bg-emerald-700'
								>
									Add
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{interests.map((interest, idx) => (
									<Badge
										key={idx}
										className="flex items-center gap-1 pr-1"
									>
										{interest}
										<button
											type="button"
											onClick={() =>
												handleRemoveInterest(idx)
											}
											className="ml-1"
										>
											<X className="w-3 h-3" />
										</button>
									</Badge>
								))}
							</div>
						</div>
						<div>
							<label className="block mb-1 font-medium">Skills</label>
							<div className="flex gap-2 mb-2">
								<Input
									name="skillInput"
									value={skillInput}
									onChange={(e) => setSkillInput(e.target.value)}
									placeholder="Add a skill"
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleAddSkill();
										}
									}}
								/>
								<Button
									type="button"
									onClick={handleAddSkill}
									disabled={!skillInput.trim()}
								>
									Add
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{skills.map((skill, idx) => (
									<Badge
										key={idx}
										className="flex items-center gap-1 pr-1 bg-blue-100 text-blue-800"
									>
										{skill}
										<button
											type="button"
											onClick={() => handleRemoveSkill(idx)}
											className="ml-1"
										>
											<X className="w-3 h-3" />
										</button>
									</Badge>
								))}
							</div>
						</div> */}

					</form>
				</div>
			</div>
		</div>
	);
}
