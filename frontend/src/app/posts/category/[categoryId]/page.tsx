'use client';

import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostItem } from '@/components/posts/PostItem';
import { usePosts } from '@/services/post/post';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PostCategoryPage() {
	const params = useParams();
	const { categoryId } = params;
	const {
		data: posts,
		isLoading: isLoadingPosts,
		isError: isErrorPosts,
	} = usePosts(typeof categoryId === 'string' ? categoryId : null);

	useEffect(() => {
		AOS.init({
			duration: 500,
			once: true,
			offset: 80,
		});
	}, []);
	if (!categoryId) {
		return (
			<div className="p-4 text-center text-gray-500">
				Invalid category.
			</div>
		);
	}

	return (
		<div
			data-aos="fade-up"
			className="h-full px-10 py-8 space-y-6 rounded-lg bg-gray-50 dark:bg-gray-900"
		>
			{' '}
			{/* Breadcrumb */}
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/posts" className='bg-green-3 text-black py-1 px-2 rounded-lg hover:scale-102 hover:bg-emerald-600 hover:text-white border-1'>Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Community</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			{/* Header Card */}
			<Card className="bg-green-1 text-white shadow-md border-none">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						<div className="text-2xl font-bold">Community</div>
						<div className="text-sm font-normal pt-2">
							{posts ? posts.length : 0} Posts · A place to share
							ideas and discussions
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-between text-sm">
					<div>
						A space for students to share ideas, experiences, and
						discussions within the university community.
					</div>
				</CardContent>
			</Card>
			{/* Community Discussions */}
			<Card className="shadow-sm overflow-hidden rounded-lg">
				<CardHeader className="text-green-2 mb-[-20]">
					<CardTitle className="text-lg font-semibold">
						Latest Posts
					</CardTitle>
				</CardHeader>

				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700 p-0">
					{isLoadingPosts ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="animate-spin w-8 h-8 text-green-1" />
						</div>
					) : (
						posts &&
						posts.map((post, i) => (
							<PostItem
								key={i}
								id={post.id}
								title={post.title}
								category={post.category_label}
								author={post.author_name}
								time={post.minutes_since_posted}
								comments={post.comment_count}
								attachments={post.attachments}
							/>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
