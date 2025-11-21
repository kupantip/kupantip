'use client';

import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { useHotPosts, useSummaryStats } from '@/services/post/post';
import { useAnnouncement } from '@/services/announcement/announcement';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Heart,
	ThumbsUp,
	MessageSquare,
	ArrowRight,
	Loader2,
} from 'lucide-react';
import { formatMinutes } from '@/lib/time';
import { useRouter } from 'next/navigation';
import AnnouncementPreviewItem from '@/components/announcement/AnnouncementPreviewItem';
import StackAnnoncement from '@/components/announcement/StackAnnouncement';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HomePage() {
	const {
		data: hotPosts,
		isLoading: isLoadingHotPosts,
		isError: isErrorHotPosts,
	} = useHotPosts();
	const {
		data: announcements,
		isLoading: isLoadingAnnouncements,
		isError: isErrorAnnouncements,
	} = useAnnouncement();
	// const {
	// 	data: summaryStats,
	// 	isLoading: isLoadingSummary,
	// 	isError: isErrorSummary,
	// } = useSummaryStats();
	const router = useRouter();

	const handlePostClick = (postId: string, isAnnouncement?: boolean) => {
		if (isAnnouncement) {
			router.push(`/posts/annoucement/${postId}`);
		} else {
			router.push(`/posts/${postId}`);
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
			{' '}
			{/* Breadcrumb */}
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>Home</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			{/* Banner Section */}
			<Card className="bg-green-1 text-white shadow-md border-none rounded-xl">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Welcome to KU Pantip 🎓
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-between">
					<p className="text-sm">
						Explore the latest updates, discussions, and
						opportunities across our KU community.
					</p>
					<Button
						variant="secondary"
						className="bg-white text-green-1 hover:bg-gray-100 cursor-pointer hover:scale-105"
						onClick={() => router.push('/posts/create')}
					>
						+ New Post
					</Button>
				</CardContent>
			</Card>
			{/* Announcements */}
			<Card className="shadow-sm rounded-lg">
				<CardHeader className="text-green-2 mb-[-20]">
					<CardTitle className="text-lg font-semibold">
						📢 Announcements
					</CardTitle>
				</CardHeader>
				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700 p-0">
					{isLoadingAnnouncements ? (
						<div className="flex justify-center items-center h-20">
							<Loader2 className="animate-spin w-8 h-8 text-green-1" />
						</div>
					) : (
						<StackAnnoncement announcements={announcements} />
					)}
				</CardContent>
			</Card>
			{/* Hot Posts */}
			<Card className="shadow-sm overflow-hidden rounded-lg">
				<CardHeader className="text-green-2 mb-[-20]">
					<CardTitle className="text-lg font-semibold">
						🔥 Hot Post
					</CardTitle>
				</CardHeader>
				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700 p-0">
					{isLoadingHotPosts ? (
						<div className="flex justify-center items-center h-20">
							<Loader2 className="animate-spin w-8 h-8 text-green-1" />
						</div>
					) : (
						hotPosts?.map((post, i) => (
							<div
								key={i}
								onClick={() => handlePostClick(post.id)}
								className="group py-4 px-6 flex flex-row justify-between items-start md:items-center bg-white dark:bg-gray-900 
									hover:bg-gray-100 dark:hover:bg-gray-800 
									rounded-lg 
									transition-all duration-300 ease-in-out 
									hover:shadow-md cursor-pointer gap-4 md:gap-0"
							>
								<div className="group-hover:pl-2 transition-all duration-300 ease-in-out flex-1 min-w-0 pr-2">
									<h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:underline text-base md:text-lg break-words">
										{post.title}
									</h3>
									<div className="flex flex-col mt-1 md:mt-0">
										<div className="flex items-center gap-2 mb-1">
											<Badge
												variant="secondary"
												className="bg-green-100 text-green-800 hover:bg-green-200"
											>
												{post.category_label}
											</Badge>
											<span className="text-gray-600 font-medium">{post.author_name}</span>
										</div>
										<span className="text-gray-400 text-xs">
											{formatMinutes(post.minutes_since_posted)}
										</span>
									</div>
								</div>
								<div className="flex flex-col md:flex-row gap-2 shrink-0 items-end">
									<Button className="group cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105 h-8 md:h-10 w-14 md:w-16 text-xs md:text-sm p-0">
										<Heart
											className={`${
												post.liked_by_requesting_user
													? 'text-red-500'
													: 'text-gray-400'
											} w-4 h-4 md:w-5 md:h-5`}
											fill={
												post.liked_by_requesting_user
													? 'currentColor'
													: 'none'
											}
										/>
										<span className="ml-1 text-black">
											{post.vote_count}
										</span>
									</Button>
									<Button className="flex items-center text-blank cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105 h-8 md:h-10 w-14 md:w-16 text-xs md:text-sm p-0">
										<MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
										<span className="ml-1">{post.comment_count}</span>
									</Button>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
