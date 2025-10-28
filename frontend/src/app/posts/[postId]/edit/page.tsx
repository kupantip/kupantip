'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
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
} from "@/components/ui/select"

export default function EditPostPage() {
	const router = useRouter();
	const params = useParams() as { postId: string };
	const postId = params.postId;

	const [loading, setLoading] = useState(false);

	const [post, setPost] = useState<Post | null>(null);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [category_id, setCategoryid] = useState('');

	const { data: categories } = useCategories();

	useEffect(() => {
			AOS.init({
				duration: 500,
				once: true,
				offset: 80,
			});
		}, []);

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

				AOS.refresh();
			} catch (err) {
				console.error('Failed to fetch post', err);
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
			await updatePost({ title, body_md: body, category_id }, post.id);
			router.push(`/posts/category/${category_id}`);
		} catch (err) {
			console.error('Failed to update post', err);
		}
	};

	return (
		<div
			data-aos="fade-up"
			className="flex justify-center items-start min-h-screen bg-white p-8 tr">
			<div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">
				<h1 className="text-3xl font-bold mb-4">Edit Post</h1>

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
					<textarea
						className="border rounded-xl p-3"
						value={body}
						onChange={(e) => setBody(e.target.value)}
						placeholder="Body text (optional)"
						rows={10}
					/>
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
		</div>
	);
}
