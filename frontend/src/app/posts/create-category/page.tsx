'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCreateRequestedCategory } from '@/services/admin/category';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AlertTriangle } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CreateCategoryPage() {
	const [formData, setFormData] = useState({
		label: '',
		color_hex: '#10b981', // default to emerald
		detail: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const router = useRouter();

	const createCategoryMutation = useCreateRequestedCategory();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);
		try {
			const res = await createCategoryMutation.mutateAsync(formData);
			if ('data' in res) {
				setSuccess(true);
				setTimeout(() => {
					router.push('/posts');
				}, 1200);
			} else {
				setError(res.message || 'Failed to create category request');
			}
		} catch (err: any) {
			// Try to show backend error message if available
			const backendMsg = err?.response?.data?.message;
			setError(
				backendMsg || err.message || 'Failed to create category request'
			);
		} finally {
			setLoading(false);
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
		<div
			data-aos="fade-up"
			className="h-full px-10 py-8 space-y-6 rounded-lg bg-gray-50 dark:bg-gray-900"
		>
			<div className="w-full max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">
				<h1 className="text-2xl font-bold mb-2 text-gray-800">
					Request Category
				</h1>
				<p className="mb-4 text-gray-600">
					Your category request will be reviewed by an administrator
					before approval.
				</p>
				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<input
						type="text"
						placeholder="Category name..."
						value={formData.label}
						onChange={(e) =>
							setFormData({ ...formData, label: e.target.value })
						}
						className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-700"
						required
					/>
					<input
						type="text"
						placeholder="Detail"
						value={formData.detail}
						onChange={(e) =>
							setFormData({ ...formData, detail: e.target.value })
						}
						className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-700"
						required
						maxLength={100}
					/>
					<div className="flex items-center gap-3">
						<input
							type="color"
							value={formData.color_hex}
							onChange={(e) =>
								setFormData({
									...formData,
									color_hex: e.target.value,
								})
							}
							className="w-8 h-8 p-0 border-2 border-gray-200 rounded-full cursor-pointer"
							title="Pick a color for this category"
							required
						/>
						<span className="text-gray-700 font-medium">
							Pick a color
						</span>
						<span className="ml-2 text-xs text-gray-500">
							{formData.color_hex}
						</span>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="secondary"
							onClick={() => router.back()}
							className="bg-gray-200 text-black rounded-lg hover:bg-gray-300 hover:shadow-md hover:scale-105 cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading}
							className="bg-emerald-700 hover:bg-emerald-800 hover:shadow-md hover:scale-105 rounded-lg cursor-pointer"
						>
							{loading ? 'Creating...' : 'Create'}
						</Button>
					</div>
				</form>
				{success && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-4 text-green-600 font-semibold text-center"
					>
						Request created successfully!
					</motion.div>
				)}
			</div>
			<AlertDialog open={!!error} onOpenChange={() => setError(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<div className="flex gap-2 text-red-500 items-center">
							<AlertTriangle className="w-5 h-5" />
							<AlertDialogTitle>Error</AlertDialogTitle>
						</div>
						<AlertDialogDescription>{error}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="cursor-pointer w-full">
							Close
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
