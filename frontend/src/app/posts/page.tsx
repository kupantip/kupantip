'use client';

import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { useHotPosts, useSummaryStats } from '@/services/post/post';
import { useAnnouncements } from '@/services/announcement/announcement';
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
import { Heart, ThumbsUp, MessageSquare, ArrowRight } from 'lucide-react';
import { formatMinutes } from '@/lib/time';

// still using mock data

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
	} = useAnnouncements();
	const {
		data: summaryStats,
		isLoading: isLoadingSummary,
		isError: isErrorSummary,
	} = useSummaryStats();

	useEffect(() => {
		AOS.init({
			duration: 500,
			once: true,
			offset: 80,
		});
	}, []);

	const topSummaryStats = summaryStats
		?.sort((a, b) => b.post_count - a.post_count)
		.slice(0, 3);

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
					>
						+ New Post
					</Button>
				</CardContent>
			</Card>
			{/* Announcements */}
			<Card className="shadow-sm overflow-hidden rounded-lg">
				<CardHeader className="text-green-2 mb-[-20]">
					<CardTitle className="text-lg font-semibold">
						📢 Announcements
					</CardTitle>
				</CardHeader>
				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700 p-0">
					{announcements?.map((post, i) => (
						<div
							key={i}
							className="group py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 
									hover:bg-gray-100 dark:hover:bg-gray-800 
									rounded-lg 
									transition-all duration-300 ease-in-out 
									hover:shadow-md"
						>
							<div className="group-hover:pl-2 transition-all duration-300 ease-in-out">
								<h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:underline cursor-pointer">
									{post.title}
								</h3>
								<p className="text-sm text-gray-500">
									<Badge
										variant="secondary"
										className="mr-2 bg-green-100 text-green-800"
									>
										{post.category_label}
									</Badge>
									{post.author_name} •{' '}
									{formatMinutes(
										post.minutes_since_announced
									)}
								</p>
							</div>
							<div className="flex flex-wrap gap-x-2">
								<Button className="group cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105">
									<Heart
										className="text-red-500"
										fill="currentColor"
									/>
								</Button>
								<Button className="flex items-center text-blank cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105">
									💬{' '}
									<span className="ml-1 text-sm">
										{post.comment_count}
									</span>
								</Button>
							</div>
						</div>
					))}
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
					{hotPosts?.map((post, i) => (
						<div
							key={i}
							className="group py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 
									hover:bg-gray-100 dark:hover:bg-gray-800 
									rounded-lg 
									transition-all duration-300 ease-in-out 
									hover:shadow-md"
						>
							<div className="group-hover:pl-2 transition-all duration-300 ease-in-out">
								<h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:underline cursor-pointer">
									{post.title}
								</h3>
								<p className="text-sm text-gray-500">
									<Badge
										variant="secondary"
										className="mr-2 bg-green-100 text-green-800"
									>
										{post.category_label}
									</Badge>
									{post.author_name} •{' '}
									{formatMinutes(post.minutes_since_posted)}
								</p>
							</div>
							<div className="flex flex-wrap gap-x-2">
								<Button className="group cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105">
									<Heart
										className="text-red-500"
										fill="currentColor"
									/>
								</Button>
								<Button className="flex items-center text-blank cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105">
									💬{' '}
									<span className="ml-1 text-sm">
										{post.comment_count}
									</span>
								</Button>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
			{/* Summary Section */}
			{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{topSummaryStats?.map((item) => (
					<Card
						key={item.category_id}
						className="shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-xl border-t-4 flex flex-col"
						style={{
							borderTopColor: item.category_color || '#10B981',
						}}
					>
						<CardHeader className="pb-1 pt-2">
							<CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
								{item.category_label}
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center justify-center p-1 flex-grow">
							<p className="text-3xl font-bold text-gray-900 dark:text-white">
								{item.post_count.toLocaleString()}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								Total Posts
							</p>
							<div className="flex space-x-4 mt-1 text-xs text-gray-600 dark:text-gray-300">
								<div className="flex items-center">
									<ThumbsUp className="w-3 h-3 mr-1" />
									<span>
										{item.total_vote_count.toLocaleString()}
									</span>
								</div>
								<div className="flex items-center">
									<MessageSquare className="w-3 h-3 mr-1" />
									<span>
										{item.total_comment.toLocaleString()}
									</span>
								</div>
							</div>
						</CardContent>
						<CardFooter className="p-1 mt-auto">
							<a
								href={`/posts/category/${item.category_id}`}
								className="w-full"
							>
								<Button
									variant="ghost"
									size="sm"
									className="w-full text-green-1 hover:bg-green-50 dark:hover:bg-gray-800"
								>
									View More{' '}
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</a>
						</CardFooter>
					</Card>
				))}
			</div> */}
		</div>
	);
}
