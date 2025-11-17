'use client';

import { useEffect, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import {
	useProfileByUserId,
	fetchUpdateProfile,
	UpdateProfileInput,
} from '@/services/user/profile';
import { useSession } from 'next-auth/react';

interface EditProfileProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	onSuccess?: () => void;
}

export default function EditProfile({
	open,
	onOpenChange,
	userId,
	onSuccess,
}: EditProfileProps) {
	const { data: profile, isLoading } = useProfileByUserId(userId);
	const [form, setForm] = useState<UpdateProfileInput>({
		bio: '',
		interests: '',
		skills: '',
	});
	const [interests, setInterests] = useState<string[]>([]);
	const [skills, setSkills] = useState<string[]>([]);
	const [interestInput, setInterestInput] = useState('');
	const [skillInput, setSkillInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { data: session } = useSession();

	useEffect(() => {
		if (profile) {
			setForm({
				bio: profile.bio || '',
				interests: profile.interests || '',
				skills: profile.skills || '',
			});
			setInterests(
				profile.interests
					? profile.interests
							.split(',')
							.map((i) => i.trim())
							.filter(Boolean)
					: []
			);
			setSkills(
				profile.skills
					? profile.skills
							.split(',')
							.map((s) => s.trim())
							.filter(Boolean)
					: []
			);
		}
	}, [profile]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await fetchUpdateProfile({
				bio: form.bio,
				interests: interests.join(','),
				skills: skills.join(','),
			});
			if (res.message === 'Profile updated successfully') {
				onOpenChange(false);
				if (onSuccess) onSuccess();
			} else {
				setError(res.message);
			}
		} catch (err: any) {
			setError(err.message || 'Failed to update profile');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block mb-1 font-medium">Bio</label>
						<Textarea
							name="bio"
							value={form.bio}
							onChange={handleChange}
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
					</div>
					{error && (
						<div className="text-red-600 text-sm">{error}</div>
					)}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-emerald-600"
							disabled={loading}
						>
							{loading ? 'Saving...' : 'Save'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
