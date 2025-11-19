'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SquarePen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchSignupUser } from '@/services/user/auth';
import { toast } from 'sonner';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function SignUp() {
	const [formData, setFormData] = useState({
		email: '',
		handle: '',
		display_name: '',
		password: '',
		bio: '',
		interests: '',
		skills: '',
	});

	const [previewData, setPreviewData] = useState({
        handle: '',
        display_name: ''
    });

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === 'handle' || name === 'display_name') {
			setPreviewData(prev => ({
				...prev,
				[name]: value
			}));
		}
	};

	const router = useRouter();
	const [ErrorMessage, setErrorMessage] = useState('');
	const [isError, setIsError] = useState(false);

	const [PasswordErrorMessage, setPasswordErrorMessage] = useState('');
	const [isPasswordError, setIsPasswordError] = useState(false);

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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setIsError(false);
		setIsPasswordError(false);
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const result = await fetchSignupUser({
				...formData,
				bio: formData.bio,
				interests: interests.join(','),
				skills: skills.join(','),
			});
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

	useEffect(() => {
		AOS.init({
			duration: 500,
			once: true,
			offset: 80,
		});
	}, []);

	return (
		<div data-aos='fade-up' className='min-h-screen bg-gray-100 p-6 flex justify-center items-center'>
			<div className='bg-white max-w-3xl w-full rounded-lg shadow-lg p-8'>
				<div className='flex'>
					<h1 className="text-4xl font-bold py-2">Create Account</h1>
				</div>
				<div className='flex flex-col gap-8 py-6'>
					<div className="flex items-center gap-3">
						<Avatar className="w-24 h-24 border-3 border-emerald-600 dark:border-emerald-700">
							<AvatarImage
								src={`https://api.dicebear.com/7.x/initials/svg?seed=${previewData.display_name}`}
							/>
							<AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
								{(previewData.display_name || '').charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="ml-4 flex-1 flex flex-col">
							<span className="font-semibold truncate max-w-[200px] text-2xl">
								{previewData.display_name}
							</span>
							<span className="font-semibold truncate max-w-[200px] text-gray-400">
								{previewData.handle ? `@${previewData.handle}` : ''}
							</span>
						</div>
					</div>
					<form onSubmit={handleSubmit} className=''>
						<div className='grid grid-cols-2 gap-6'>
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
									onBlur={handleBlur}
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

							<div>
								<label className="text-sm font-medium">Display Name</label>
								<Input
									type='text'
									name='display_name'
									value={formData.display_name}
									onChange={handleChange}
									onBlur={handleBlur}
									required
									className="w-full mt-1 border rounded-xl p-3 text-sm"
									placeholder="Your Display Name"
								/>
							</div>

						</div>
						<div className='flex mt-6 mb-4'>
							<div className='flex gap-2 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0'>
								<h2 className="">
									About Me
								</h2>
								<SquarePen className='mt-1'/>
							</div>
						</div>
						<div className='flex flex-col gap-6'>

							<div>
								<label className="block mb-1 font-medium">Bio</label>
								<Textarea
									name="bio"
									value={formData.bio}
									onChange={handleChange}
									rows={3}
									placeholder="Tell us about yourself"
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
											className="flex items-center gap-1 pr-1 bg-orange-100 text-orange-800"
										>
											{interest}
											<button
												type="button"
												onClick={() =>
													handleRemoveInterest(idx)
												}
												className="ml-1"
											>
												<X className="w-3 h-3 cursor-pointer" />
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
										className='cursor-pointer bg-emerald-600 hover:bg-emerald-700'
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
												<X className="w-3 h-3 cursor-pointer" />
											</button>
										</Badge>
									))}
								</div>

							</div>
						</div>
						<div className='max-w-md flex mt-10 ml-auto mr-auto'>
							<Button
								type='submit' 
								className='bg-emerald-600 hover:bg-emerald-700 w-full cursor-pointer rounded-full py-6 text-lg'
							>
								Sign Up
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
