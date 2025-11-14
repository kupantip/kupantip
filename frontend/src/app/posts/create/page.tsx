'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { createPost } from '@/services/user/create-post_page';
import { useCategories } from '@/services/post/category';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { X } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export default function CreatePostPage() {
	const [tab, setTab] = useState<'text' | 'media'>('text');
	const [formData, setFormData] = useState({
		title: '',
		body_md: '',
		url: '',
		category_id: '',
		files: [] as File[],
	});

	const { data: categories } = useCategories();
	const { open: isSidebarOpen } = useSidebar();

	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const [banInfo, setBanInfo] = useState<{
		message: string;
		reason: string;
		end_at: string;
	} | null>(null);

	const onDrop = (acceptedFiles: File[]) => {
		setFormData((prev) => ({
			...prev,
			files: [...prev.files, ...acceptedFiles],
		}));
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': [],
		},
	});

	const handleSelectCategory = (value: string) => {
		setFormData({ ...formData, category_id: value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const postId = uuidv4();
		const postUrl = `http://post/${postId}`;

		try {
			await createPost({ ...formData, url: postUrl });
			router.push(`/posts/category/${formData.category_id}`);
		} catch (err: unknown) {
			console.error('Failed to create post: ', err);

			if (
				typeof err === 'object' &&
				err !== null &&
				'status' in err &&
				(err as { status?: number }).status === 403
			) {
				const e = err as {
					message?: string;
					reason?: string;
					end_at?: string;
				};
				setBanInfo({
					message: e.message ?? 'You are banned',
					reason: e.reason ?? '-',
					end_at: e.end_at ?? '-',
				});
				return;
			}
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
				<h1 className="text-2xl font-bold mb-6 text-gray-800">
					Create Post
				</h1>

				<div className="flex gap-6 border-b mb-6">
					{['text', 'media'].map((type) => (
						<button
							key={type}
							onClick={() => setTab(type as 'text' | 'media')}
							className={`relative pb-2 font-medium transition-colors ${
								tab === type
									? 'text-emerald-700 p-2 hover:bg-gray-100 cursor-pointer'
									: 'text-gray-500 p-2 hover:bg-gray-100 cursor-pointer'
							}`}
						>
							{type === 'text' ? 'Text' : 'Images'}
							{tab === type && (
								<motion.div
									layoutId="underline"
									className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-700 rounded-full"
								/>
							)}
						</button>
					))}
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<input
						type="text"
						placeholder="Enter your post title..."
						value={formData.title}
						onChange={(e) =>
							setFormData({ ...formData, title: e.target.value })
						}
						className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-700"
						required
					/>

					<Select
						onValueChange={handleSelectCategory}
						value={formData.category_id}
					>
						<SelectTrigger className="border border-gray-300 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer">
							<SelectValue placeholder="Select Category" />
						</SelectTrigger>
						<SelectContent>
							{categories?.map((category) => (
								<SelectItem
									key={category.id}
									value={category.id}
								>
									{category.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{tab === 'text' ? (
						<textarea
							placeholder="Write something interesting..."
							value={formData.body_md}
							onChange={(e) =>
								setFormData({
									...formData,
									body_md: e.target.value,
								})
							}
							className="border border-gray-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-700"
							rows={10}
							required
						/>
					) : (
						<div className="flex flex-col gap-4">
							<div
								{...getRootProps()}
								className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
									isDragActive
										? 'bg-emerald-50 border-emerald-400'
										: 'border-gray-300 hover:border-emerald-500'
								} cursor-pointer min-h-[200px] flex flex-col justify-center items-center`}
							>
								<input {...getInputProps()} />
								{formData.files.length === 0 ? (
									<div className="text-gray-500 flex flex-col items-center">
										<Upload
											className="mb-2 opacity-70"
											size={50}
										/>
										<p className="font-semibold">
											Drag and Drop or upload media
										</p>
										<p className="text-sm">
											Click here to browse
										</p>
									</div>
								) : (
									<div className="grid grid-cols-4 gap-3 w-full">
										{formData.files.map((file, i) => (
											<div
												key={i}
												className="relative group"
											>
												{file.type.startsWith(
													'image/'
												) ? (
													<Image
														src={URL.createObjectURL(
															file
														)}
														alt={`Upload preview ${
															i + 1
														}`}
														width={200}
														height={200}
														className="rounded-lg object-cover h-full w-full"
													/>
												) : (
													<video
														src={URL.createObjectURL(
															file
														)}
														controls
														className="rounded-lg object-cover h-32 w-full"
													/>
												)}
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setFormData((prev) => ({
															...prev,
															files: prev.files.filter(
																(_, idx) =>
																	idx !== i
															),
														}));
													}}
													className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
												>
													<X size={18} />
												</button>
											</div>
										))}
									</div>
								)}
							</div>

							<textarea
								placeholder="Add a caption or description..."
								value={formData.body_md}
								onChange={(e) =>
									setFormData({
										...formData,
										body_md: e.target.value,
									})
								}
								className="border border-gray-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-700"
								rows={10}
								required
							/>
						</div>
					)}

					<div className="flex justify-end gap-2">
						<Link href={`/posts`}>
							<Button className="bg-gray-200 text-black rounded-full hover:bg-gray-300 hover:shadow-md hover:scale-105 cursor-pointer">
								Cancel
							</Button>
						</Link>
						<Button
							type="submit"
							disabled={loading}
							className="bg-emerald-700 hover:bg-emerald-800 hover:shadow-md hover:scale-105 rounded-full cursor-pointer"
						>
							{loading ? 'Posting...' : 'Post'}
						</Button>
					</div>
				</form>
			</div>

			<AlertDialog open={!!banInfo} onOpenChange={() => setBanInfo}>
				<AlertDialogContent
					className={isSidebarOpen ? 'ml-32' : 'ml-6'}
				>
					<AlertDialogHeader>
						<div className="flex gap-2 text-red-500 items-center">
							<AlertTriangle className="w-5 h-5" />
							<AlertDialogTitle>
								You&apos;ve been banned from posting.
							</AlertDialogTitle>
						</div>
						<AlertDialogDescription>
							<strong className="text-black/75">Reason:</strong>{' '}
							{banInfo?.reason}
						</AlertDialogDescription>
						<AlertDialogDescription>
							<strong className="text-black/75">
								Ban expires on:
							</strong>{' '}
							{banInfo?.end_at
								? new Date(banInfo.end_at).toLocaleString(
										'en-En',
										{
											dateStyle: 'long',
											timeStyle: 'short',
										}
								  )
								: '-'}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							type="button"
							onClick={() => setBanInfo(null)}
							className="cursor-pointer w-full"
						>
							Close
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
