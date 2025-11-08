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
import { Loader2, Star, FileText, Heart, MessageSquare } from 'lucide-react';
import { usePriorityPosts } from '@/services/post/post';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function PriorityPostsPage() {
	const {
		data: posts,
		isLoading: isLoadingPosts,
		refetch: refetchPosts,
	} = usePriorityPosts();

	const router = useRouter();

	const refreshPage = async () => {
		refetchPosts();
	};

	const handlePostClick = (postId: string) => {
		router.push(`/posts/${postId}`);
	};

	// Loading state
	if (isLoadingPosts) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<Empty>
					<EmptyHeader>
						<EmptyMedia>
							<Loader2 className="animate-spin w-8 h-8" />
						</EmptyMedia>
						<EmptyTitle>Loading Priority Posts...</EmptyTitle>
						<EmptyDescription>
							Please wait while we fetch the priority posts for
							you.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	// No posts found
	if (!posts || posts.length === 0) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<Empty>
					<EmptyHeader>
						<EmptyMedia>
							<Star className="w-8 h-8" />
						</EmptyMedia>
						<EmptyTitle>No Priority Posts</EmptyTitle>
						<EmptyDescription>
							There are currently no priority posts available.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<div className="flex gap-2">
							<Button onClick={refreshPage}>Refresh</Button>
							<Button
								variant="outline"
								onClick={() => router.push('/posts')}
							>
								View All Posts
							</Button>
						</div>
					</EmptyContent>
				</Empty>
			</div>
		);
	}

	return (
		<div className="h-full px-10 py-8 space-y-6 rounded-lg bg-gray-50 dark:bg-gray-900">
			<div className="mb-6">
				<div className="flex items-center gap-2 mb-2">
					<Star className="w-6 h-6 text-yellow-500" />
					<h1 className="text-3xl font-bold">📌 Priority Posts</h1>
				</div>
				<p className="text-gray-600 dark:text-gray-400">
					Important announcements and featured content
				</p>
			</div>

			<Card className="shadow-sm overflow-hidden rounded-lg">
				<CardHeader className="text-green-2">
					<CardTitle className="text-lg font-semibold">
						Important Posts
					</CardTitle>
				</CardHeader>
				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700 p-0">
					{posts.map((post) => (
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
												post.minutes_since_posted / 60
										  )}h ago`
										: `${Math.floor(
												post.minutes_since_posted / 1440
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
									<span className="ml-1 text-sm">
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
					))}
				</CardContent>
			</Card>

			<div className="mt-8 flex justify-center">
				<Button onClick={refreshPage} variant="outline">
					<FileText className="w-4 h-4 mr-2" />
					Refresh Posts
				</Button>
			</div>
		</div>
	);
}
