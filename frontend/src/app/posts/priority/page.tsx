'use client';

import { Button } from '@/components/ui/button';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import { Loader2, Heart, MessageSquare } from 'lucide-react';
import { usePriorityPosts } from '@/services/post/post';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Link from 'next/link';

export default function PriorityPostsPage() {
	const {
		data: posts,
		isLoading: isLoadingPosts,
		refetch: refetchPosts,
	} = usePriorityPosts();

	const { data: session, status } = useSession();
	const router = useRouter();
	const refreshPage = async () => {
		refetchPosts();
	};
	const handlePostClick = (postId: string) => {
		router.push(`/posts/${postId}`);
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
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<Link
							href="/posts"
							className="bg-green-3 text-black py-1 px-2 rounded-lg hover:scale-102 hover:bg-emerald-600 hover:text-white border-1"
						>
							Home
						</Link>{' '}
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Priority</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			{/* Banner Section */}
			<Card className="bg-green-1 text-white shadow-md border-none rounded-xl">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Priority Post
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-between">
					<p className="text-sm">
						Important Posts from Teachers, Staffs & Admin.
					</p>
					{session?.user.role === 'admin' && (
						<Button
							variant="secondary"
							className="bg-white text-green-1 hover:bg-gray-100 cursor-pointer hover:scale-105"
						>
							+ New Post
						</Button>
					)}
				</CardContent>
			</Card>

			<Card className="shadow-sm overflow-hidden rounded-lg">
				<CardHeader className="text-green-2">
					<CardTitle className="text-lg font-semibold">
						Important Posts
					</CardTitle>
				</CardHeader>
				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700 p-0 mt-[-20]">
					{isLoadingPosts ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="animate-spin w-8 h-8 text-green-1" />
						</div>
					) : (
						posts &&
						posts.map((post) => (
							<div
								key={post.id}
								className="group py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 
                                    hover:bg-gray-100 dark:hover:bg-gray-800 
                                    rounded-lg 
                                    transition-all duration-300 ease-in-out 
                                    hover:shadow-md cursor-pointer"
								onClick={() => handlePostClick(post.id)}
							>
								<div className="group-hover:pl-2 transition-all duration-300 ease-in-out">
									<h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:underline">
										{post.title}
									</h3>
									<p className="text-sm text-gray-500">
										<Badge
											variant="secondary"
											className="mr-2 bg-yellow-100 text-yellow-800"
										>
											{post.category_label || 'Priority'}
										</Badge>
										{post.author_name} •{' '}
										{post.minutes_since_posted < 60
											? `${post.minutes_since_posted}m ago`
											: post.minutes_since_posted < 1440
											? `${Math.floor(
													post.minutes_since_posted /
														60
											  )}h ago`
											: `${Math.floor(
													post.minutes_since_posted /
														1440
											  )}d ago`}
									</p>
								</div>
								<div className="flex flex-wrap gap-x-2">
									<Button className="group cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105">
										<Heart
											className={`${
												post.liked_by_requesting_user
													? 'text-red-500'
													: 'text-gray-400'
											}`}
											fill={
												post.liked_by_requesting_user
													? 'currentColor'
													: 'none'
											}
										/>
										<span className="ml-1 text-sm text-black">
											{post.like_count}
										</span>
									</Button>
									<Button className="flex items-center text-blank cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105">
										<MessageSquare className="w-4 h-4" />
										<span className="ml-1 text-sm">
											{post.comment_count}
										</span>
									</Button>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>

			{/* <div className="mt-8 flex justify-center">
				<Button onClick={refreshPage} variant="outline">
					<FileText className="w-4 h-4 mr-2" />
					Refresh Posts
				</Button>
			</div> */}
		</div>
	);
}
