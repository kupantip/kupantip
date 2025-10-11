'use client';

import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';

// still using mock data

export default function HomePage() {
	const hotPosts = [
		{
			title: 'How to Prepare for the Next KU Tech Expo',
			category: 'Community',
			author: 'Student Affairs',
			time: '2 hours ago',
			comments: 24,
		},
		{
			title: 'Job Openings at the Engineering Faculty 🚀',
			category: 'Recruitment',
			author: 'HR Office',
			time: '5 hours ago',
			comments: 18,
		},
		{
			title: 'New Dormitory Rules Announcement',
			category: 'Announcement',
			author: 'Admin Team',
			time: '1 day ago',
			comments: 12,
		},
	];

	const summaryStats = [
		{ label: 'Announcements', count: 1240, url: 'annoucement' },
		{ label: 'Community Posts', count: 3480, url: 'community' },
		{ label: 'Recruitment Posts', count: 640, url: 'recruitment' },
	];

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
					>
						+ New Post
					</Button>
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
					{hotPosts.map((post, i) => (
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
										{post.category}
									</Badge>
									{post.author} • {post.time}
								</p>
							</div>
							<div className="flex flex-wrap gap-x-2">
								<Button className='group cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105'>
									<Heart className="text-red-500" fill="currentColor" />
								</Button>
								<Button className="flex items-center text-blank cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105">
									💬{' '}
									<span className="ml-1 text-sm">
										{post.comments}
									</span>
								</Button>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
			{/* Summary Section */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{summaryStats.map((item, i) => (
					<Card
						key={i}
						className="text-center shadow-sm hover:shadow-md transition hover:scale-102"
					>
						<CardHeader>
							<CardTitle className="text-green-1">
								{item.label}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
								{item.count.toLocaleString()}
							</p>
							<p className="text-sm text-gray-500 mt-1">
								View more →
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
