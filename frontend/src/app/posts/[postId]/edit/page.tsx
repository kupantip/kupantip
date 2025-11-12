'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from '@/services/post/category';
import { Post } from '@/types/dashboard/post';
import { getPostById } from '@/services/dashboard/getPostById';
import { updatePost } from '@/services/user/updatePost';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'sonner';
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
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

type ExistingAttachment = {
    id: string;
    url: string;
    isNew: false;
};

type NewUpload = {
    id: string; 
    url: string; 
    isNew: true; 
    file: File;
};

type CombinedImage = ExistingAttachment | NewUpload;

export default function EditPostPage() {
	const router = useRouter();
	const params = useParams() as { postId: string };
	const postId = params.postId;

	const queryClient = useQueryClient();

	const [loading, setLoading] = useState(false);

	const [tab, setTab] = useState<'text' | 'media'>('text');

	const [post, setPost] = useState<Post | null>(null);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [category_id, setCategoryid] = useState('');
	const [files, setFiles] = useState([] as File[])

	const [attachmentsToDelete, setAttachmentsToDelete] = useState<string[]>([]);

	const { data: categories } = useCategories();

	const [banInfo, setBanInfo] = useState<{
		message: string;
		reason: string;
		end_at: string;
	} | null>(null);

	const {open: isSidebarOpen} = useSidebar();

	useEffect(() => {
			AOS.init({
				duration: 500,
				once: true,
				offset: 80,
			});
		}, []);

	const onDrop = (acceptedFiles: File[]) => {
		setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': [],
		},
	});

	useEffect(() => {
		async function fetchPost() {
			try {
				const fetchedPosts: Post[] = await getPostById(postId);
				if (fetchedPosts.length === 0) {
					console.error('Post not found');
					return;
				}

				const fetchedPost = fetchedPosts[0];
				setPost(fetchedPost);
				setTitle(fetchedPost.title);
				setBody(fetchedPost.body_md || '');
				setCategoryid(fetchedPost.category_id || '');

                if (fetchedPost.attachments && fetchedPost.attachments.length > 0) {
                    setTab('media');
                }

				AOS.refresh();
			} catch (err) {
				console.error('Failed to fetch post', err);
			} finally {
				setLoading(false);
			}
		}
		fetchPost();
	}, [postId]);

	const handleSelectCategory = (value : string) => {
		setCategoryid(value)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		if (!post) return;
		try {
			await updatePost({ title, body_md: body, category_id, files }, post.id);
			await queryClient.invalidateQueries({ queryKey: ['postDetail', post.id] });
			toast.success('Edit Post Successfully!');
			router.push(`/posts/${post.id}`);
		} catch (err : unknown) {
			console.error("Failed to edit post: ", err);

			if (
				typeof err === "object" &&
				err !== null &&
				"status" in err &&
				(err as { status?: number }).status === 403
			) {
				const e = err as { message?: string; reason?: string; end_at?: string };
				setBanInfo({
					message: e.message ?? "You are banned",
					reason: e.reason ?? "-",
					end_at: e.end_at ?? "-",
				});
				return;
			}

		} finally {
			setLoading(false);
		}
	};

    const removeNewFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (attachmentId: string) => {
        setAttachmentsToDelete(prev => [...prev, attachmentId]);
    };

    if (!post) {
		return;
    }

    const existingAttachments: ExistingAttachment[] = post.attachments
        .filter(att => !attachmentsToDelete.includes(att.id))
        .map(att => ({
            id: att.id,
            url: att.url.includes('/backend/')
                ? att.url
                : att.url.replace('/uploads/', '/backend/post/attachments/'),
            isNew: false,
        }));
        
    const newUploads: NewUpload[] = files.map((file, i) => ({
        id: `new-${i}`,
        url: URL.createObjectURL(file),
        isNew: true,
        file: file 
    }));
    
    const combinedImages: CombinedImage[] = [...existingAttachments, ...newUploads];

	return (
		<div
			data-aos="fade-up"
			className="flex justify-center items-start min-h-screen bg-white p-8 tr">
			<div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">
				<h1 className="text-3xl font-bold mb-4">Edit Post</h1>

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
						className="border rounded-xl p-3"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Title"
						required
					/>
					<Select
						onValueChange={handleSelectCategory}
						value={category_id}
					>
						<SelectTrigger className="border border-gray-300 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer">
						<SelectValue placeholder="Select Category" />
						</SelectTrigger>
						<SelectContent>
						{categories?.map((category) => (
							<SelectItem key={category.id} value={category.id}>
							{category.label}
							</SelectItem>
						))}
						</SelectContent>
					</Select>

					{tab === 'text' ? (
						<textarea
							placeholder="Write something interesting..."
							value={body}
							onChange={(e) =>
								setBody(e.target.value)
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
								{combinedImages.length === 0 ? (
                                    <div className="text-gray-500 flex flex-col items-center">
                                        <Upload className='mb-2 opacity-70' size={50}/>
                                        <p className="font-semibold">Drag and Drop or upload media</p>
                                        <p className="text-sm">Click here to browse</p>
                                    </div>
								) : (
									<div className="grid grid-cols-4 gap-3 w-full">
										{combinedImages.map((image, combinedIndex) => (
											<div
												key={image.id}
												className="relative group aspect-square"
											>
												<Image
													src={image.url}
													alt={`Gallery item ${combinedIndex + 1}`}
													width={200}
													height={200}
													className="rounded-lg object-cover h-full w-full"
												/>
												<button
													type="button"
													onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (image.isNew) {
                                                            const fileIndex = files.findIndex(f => f === image.file);
                                                            if (fileIndex > -1) removeNewFile(fileIndex);
                                                        } else {
                                                            removeExistingAttachment(image.id);
                                                        }
                                                    }}
													className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
												>
													<X size={18}/>
												</button>
											</div>
										))}
									</div>
								)}
							</div>

							<textarea
								placeholder="Add a caption or description..."
								value={body}
								onChange={(e) =>
									setBody(e.target.value)
								}
								className="border border-gray-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-700"
								rows={10}
								required
							/>
						</div>
					)}

					<div className="flex justify-end gap-2">
						<Link href={`/posts/${postId}`}>
							<Button className="bg-gray-200 text-black rounded-full hover:bg-gray-300 hover:shadow-md hover:scale-105 cursor-pointer">
								Cancel
							</Button>
						</Link>
						<Button
							type="submit"
							disabled={loading}
							className="bg-emerald-700 hover:bg-emerald-800 hover:shadow-md hover:scale-105 rounded-full cursor-pointer"
						>
							{loading ? "Saving..." : "Save"}
						</Button>
					</div>
				</form>
			</div>
			<AlertDialog open={!!banInfo} onOpenChange={() => setBanInfo}>
				<AlertDialogContent className={isSidebarOpen ? "ml-32" : "ml-6"}>
					<AlertDialogHeader>
						<div className='flex gap-2 text-red-500 items-center'>
							<AlertTriangle className='w-5 h-5'/>
							<AlertDialogTitle>
								You&apos;ve been banned from posting.
							</AlertDialogTitle>
						</div>
						<AlertDialogDescription>
                			<strong className='text-black/75'>Reason:</strong> {banInfo?.reason}
						</AlertDialogDescription>
						<AlertDialogDescription>
							<strong className='text-black/75'>Ban expires on:</strong>{" "}
							{banInfo?.end_at
							? new Date(banInfo.end_at).toLocaleString("en-En", {
								dateStyle: 'long',
								timeStyle: 'short'
							})
							: "-"}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							type="button"
							onClick={() => setBanInfo(null)}
							className='cursor-pointer w-full'
						>
							Close
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
